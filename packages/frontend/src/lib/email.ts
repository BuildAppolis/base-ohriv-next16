import { z } from "zod";

// Email interfaces (same as server-side)
export interface EmailProps {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  response?: string;
  domain?: string;
  to?: string | string[];
  subject?: string;
  error?: string;
  details?: any;
}

export interface SendEmailOptions extends EmailProps {
  domain: "notify.buildappolis.com" | "notify.ohriv.com";
  apiKey: string;
}

/**
 * Send an email using useSend SMTP API
 * @param options Email options including domain and API key
 * @returns Promise resolving to email response
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
  try {
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email with predefined domain configurations
 */
export class EmailService {
  private domainConfigs: Map<string, string> = new Map();

  constructor() {
    // Set your API keys here or load from environment
    this.domainConfigs.set("notify.buildappolis.com", process.env.NEXT_PUBLIC_USESEND_API_KEY_BUILDAPPOLIS || "");
    this.domainConfigs.set("notify.ohriv.com", process.env.NEXT_PUBLIC_USESEND_API_KEY_OHRIV || "");
  }

  /**
   * Set API key for a specific domain
   */
  setApiKey(domain: string, apiKey: string) {
    this.domainConfigs.set(domain, apiKey);
  }

  /**
   * Send email using buildappolis domain
   */
  async sendBuildappolisEmail(emailProps: EmailProps): Promise<EmailResponse> {
    const apiKey = this.domainConfigs.get("notify.buildappolis.com");
    if (!apiKey) {
      throw new Error("API key for notify.buildappolis.com not configured");
    }

    return sendEmail({
      ...emailProps,
      domain: "notify.buildappolis.com",
      apiKey
    });
  }

  /**
   * Send email using ohriv domain
   */
  async sendOhrivEmail(emailProps: EmailProps): Promise<EmailResponse> {
    const apiKey = this.domainConfigs.get("notify.ohriv.com");
    if (!apiKey) {
      throw new Error("API key for notify.ohriv.com not configured");
    }

    return sendEmail({
      ...emailProps,
      domain: "notify.ohriv.com",
      apiKey
    });
  }

  /**
   * Send email with custom domain and API key
   */
  async sendCustomEmail(
    domain: "notify.buildappolis.com" | "notify.ohriv.com",
    apiKey: string,
    emailProps: EmailProps
  ): Promise<EmailResponse> {
    return sendEmail({
      ...emailProps,
      domain,
      apiKey
    });
  }
}

// Singleton instance
export const emailService = new EmailService();

/**
 * Quick helper functions for common use cases
 */

export const emailTemplates = {
  /**
   * Welcome email template
   */
  welcome: (userName: string, userEmail: string): EmailProps => ({
    to: userEmail,
    subject: "Welcome to our platform!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${userName}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `Welcome, ${userName}!\n\nThank you for joining our platform. We're excited to have you on board!\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe Team`
  }),

  /**
   * Password reset template
   */
  passwordReset: (userName: string, userEmail: string, resetLink: string): EmailProps => ({
    to: userEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>Hi ${userName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `Password Reset\n\nHi ${userName},\n\nYou requested a password reset. Visit this link to reset your password: ${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Team`
  }),

  /**
   * Notification template
   */
  notification: (userName: string, userEmail: string, title: string, message: string): EmailProps => ({
    to: userEmail,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">${title}</h1>
        <p>Hi ${userName},</p>
        <p>${message}</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    text: `${title}\n\nHi ${userName},\n\n${message}\n\nBest regards,\nThe Team`
  })
};