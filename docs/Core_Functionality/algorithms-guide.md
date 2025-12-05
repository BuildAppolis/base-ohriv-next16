# Guide to Ohriv Algorithms

## Overview
Ohriv leverages three key algorithms to enhance its recruiting platform: **Weighted Average** for candidate scoring, **Quadratic Weighted Kappa (QWK)** for Inter-Rater Reliability (IRR), and **Logistic Regression** for predictive analytics. Below, each algorithm is explained with TypeScript examples.

## 1. Weighted Average
### Description
The Weighted Average algorithm calculates a candidate's overall score based on individual attribute scores (e.g., Industry Experience, Education) weighted according to job-specific priorities (summing to 100%). This ensures a balanced evaluation aligned with company needs.

### Application
Attributes autofill on a candidate card, and recruiters assign scores (0-10) without seeing weights. A "Candidate Score" button triggers the calculation.

### Example
```typescript
interface Attribute {
  name: string;
  weight: number;
  score: number;
}

function calculateWeightedAverage(attributes: Attribute[]): number {
  const weightedSum = attributes.reduce((sum, { score, weight }) => sum + score * weight, 0);
  const totalWeight = attributes.reduce((sum, { weight }) => sum + weight, 0);
  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

const attributesData: Attribute[] = [
  { name: "Industry Experience", weight: 30, score: 8 },
  { name: "Education", weight: 15, score: 6 },
  { name: "OOPS", weight: 40, score: 7 },
  { name: "Communication", weight: 15, score: 9 },
];
console.log(`Weighted Average: ${calculateWeightedAverage(attributesData).toFixed(2)}`); // Output: 7.45
```

## 2. Quadratic Weighted Kappa (QWK)
### Description
QWK measures the agreement between two raters (e.g., recruiters and interviewers) on candidate scores, accounting for the degree of disagreement with quadratic weighting. It’s used to compute the "Calibration Score" to ensure consistency.

### Application
Displayed in the Job tab (next to candidate scores) and Job Overview (average IRR), with color coding: 0-0.2 (red), 0.21-0.6 (yellow), 0.61-1.0 (green).

### Example
```typescript
interface RaterScores {
  rater1: number[];
  rater2: number[];
  numCategories: number;
}

function calculateQWK({ rater1, rater2, numCategories }: RaterScores): number {
  const observedCounts = Array(numCategories).fill(0).map(() => Array(numCategories).fill(0));
  for (let i = 0; i < rater1.length; i++) observedCounts[rater1[i]][rater2[i]]++;
  const rowTotals = observedCounts.map(row => row.reduce((sum, val) => sum + val, 0));
  const colTotals = observedCounts.map((_, i) => observedCounts.reduce((sum, row) => sum + row[i], 0));
  const totalItems = rowTotals.reduce((sum, val) => sum + val, 0);
  const expectedCounts = observedCounts.map((row, i) => row.map((_, j) => (rowTotals[i] * colTotals[j]) / totalItems));
  const weights = Array(numCategories).fill(0).map((_, i) => Array(numCategories).fill(0).map((_, j) => (i - j) ** 2));
  let numerator = 0, denominator = 0;
  for (let i = 0; i < numCategories; i++) for (let j = 0; j < numCategories; j++) {
    numerator += weights[i][j] * observedCounts[i][j];
    denominator += weights[i][j] * expectedCounts[i][j];
  }
  return 1 - (numerator / denominator);
}

const irrData: RaterScores = {
  rater1: [4, 5, 6, 4, 4],
  rater2: [2, 4, 5, 2, 4],
  numCategories: 7,
};
console.log("Quadratic Weighted Kappa (QWK):", calculateQWK(irrData).toFixed(4));
```

## 3. Logistic Regression
### Description
Logistic Regression predicts the probability of a binary outcome (e.g., offer or no offer) based on multiple input features like Tenure, OOP, and Communication. It’s ideal for small datasets, offering interpretability and robustness.

### Application
Used in Job Overview and Candidate List with an S-curved graph (0-1 y-axis, 0-10 x-axis), showing success probability on hover with a distribution plot.

### Example
```typescript
interface LRData {
  features: number[][];
  labels: number[];
}

class LogisticRegression {
  private weights: number[];
  private bias: number;
  private C: number;

  constructor({ C = 1.0 }: { C?: number } = {}) {
    this.weights = [];
    this.bias = 0;
    this.C = C;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  fit(X: number[][], y: number[]): void {
    const n_samples = X.length;
    const n_features = X[0].length;
    this.weights = Array(n_features).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < 100; epoch++) {
      for (let i = 0; i < n_samples; i++) {
        const z = this.bias + X[i].reduce((sum, x, j) => sum + x * this.weights[j], 0);
        const prediction = this.sigmoid(z);
        const error = y[i] - prediction;
        for (let j = 0; j < n_features; j++) {
          this.weights[j] += this.C * error * X[i][j];
        }
        this.bias += this.C * error;
      }
    }
  }

  predict_proba(X: number[][]): number[][] {
    return X.map(x => [1 - this.sigmoid(this.bias + x.reduce((sum, val, i) => sum + val * this.weights[i], 0)), this.sigmoid(this.bias + x.reduce((sum, val, i) => sum + val * this.weights[i], 0))]);
  }
}

const lrData: LRData = {
  features: [[5, 4.8, 8, 6.7, 7], [8, 7.8, 7.2, 7.1, 8.5], [6, 5.9, 7.3, 6.8, 7.9]],
  labels: [0, 1, 0],
};
const lrModel = new LogisticRegression({ C: 1.0 });
lrModel.fit(lrData.features, lrData.labels);
const probabilities = lrModel.predict_proba(lrData.features);
console.log("Logistic Regression Probabilities:", probabilities.map(p => p[1].toFixed(4)));
```

## Conclusion
These algorithms—Weighted Average, QWK, and Logistic Regression—form the backbone of Ohriv’s data-driven hiring process, ensuring accurate scoring, reliable calibration, and predictive insights.

