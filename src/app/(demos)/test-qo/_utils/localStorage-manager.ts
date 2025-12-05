/* eslint-disable @typescript-eslint/no-explicit-any */
// Local Storage Manager for Coordination Mode Data

export interface CoordinationData {
  id: string;
  name: string;
  content: string | any; // Support both string and object content (for AI parameters)
  timestamp: number;
  type:
    | "input_context"
    | "orchestrator_prompt"
    | "question_instructions"
    | "question_expected_output"
    | "attribute_instructions"
    | "attribute_expected_output"
    | "validation_prompt"
    | "ai_parameters";
}

export interface VersionHistory {
  id: string;
  name: string;
  versions: CoordinationData[];
  currentVersionId: string;
}

class LocalStorageManager {
  private readonly STORAGE_KEY = "coordination_mode_data";
  private readonly MAX_VERSIONS_PER_TYPE = 50; // Limit to prevent storage bloat

  // Get all coordination data from localStorage
  private getData(): Record<string, VersionHistory> {
    if (typeof window === "undefined") return {};

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return {};
    }
  }

  // Save data to localStorage
  private saveData(data: Record<string, VersionHistory>): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // Save a new version of coordination data
  saveVersion(data: Omit<CoordinationData, "id" | "timestamp">): string {
    const allData = this.getData();
    const typeKey = data.type;

    // Initialize type history if it doesn't exist
    if (!allData[typeKey]) {
      allData[typeKey] = {
        id: typeKey,
        name: this.getTypeDisplayName(data.type),
        versions: [],
        currentVersionId: "",
      };
    }

    const history = allData[typeKey];
    const newVersion: CoordinationData = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add new version
    history.versions.unshift(newVersion);

    // Limit versions to prevent storage bloat
    if (history.versions.length > this.MAX_VERSIONS_PER_TYPE) {
      history.versions = history.versions.slice(0, this.MAX_VERSIONS_PER_TYPE);
    }

    // Update current version
    history.currentVersionId = newVersion.id;

    this.saveData(allData);
    return newVersion.id;
  }

  // Get current version for a type
  getCurrentVersion(type: CoordinationData["type"]): CoordinationData | null {
    const allData = this.getData();
    const history = allData[type];

    if (!history || !history.currentVersionId) return null;

    return (
      history.versions.find((v) => v.id === history.currentVersionId) || null
    );
  }

  // Get all versions for a type
  getVersions(type: CoordinationData["type"]): CoordinationData[] {
    const allData = this.getData();
    return allData[type]?.versions || [];
  }

  // Load a specific version
  loadVersion(
    type: CoordinationData["type"],
    versionId: string
  ): CoordinationData | null {
    const allData = this.getData();
    const history = allData[type];

    if (!history) return null;

    const version = history.versions.find((v) => v.id === versionId);
    if (version) {
      // Update current version to this one
      history.currentVersionId = versionId;
      this.saveData(allData);
    }

    return version || null;
  }

  // Delete a specific version
  deleteVersion(type: CoordinationData["type"], versionId: string): boolean {
    const allData = this.getData();
    const history = allData[type];

    if (!history) return false;

    const versionIndex = history.versions.findIndex((v) => v.id === versionId);
    if (versionIndex === -1) return false;

    // Remove the version
    history.versions.splice(versionIndex, 1);

    // If we deleted the current version, set a new current version
    if (history.currentVersionId === versionId) {
      history.currentVersionId = history.versions[0]?.id || "";
    }

    // Clean up if no versions left
    if (history.versions.length === 0) {
      delete allData[type];
    }

    this.saveData(allData);
    return true;
  }

  // Clear all data for a type
  clearType(type: CoordinationData["type"]): void {
    const allData = this.getData();
    delete allData[type];
    this.saveData(allData);
  }

  // Get display name for type
  private getTypeDisplayName(type: CoordinationData["type"]): string {
    switch (type) {
      case "input_context":
        return "Input Context";
      case "orchestrator_prompt":
        return "Orchestrator Prompt";
      case "question_instructions":
        return "Question Instructions";
      case "question_expected_output":
        return "Question Expected Output";
      case "attribute_instructions":
        return "Attribute Instructions";
      case "attribute_expected_output":
        return "Attribute Expected Output";
      case "validation_prompt":
        return "Validation Prompt";
      default:
        return type;
    }
  }

  // Format timestamp for display
  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const localStorageManager = new LocalStorageManager();
