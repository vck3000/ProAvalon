import promClient, { Counter } from 'prom-client';
import { promAgent } from './promAgent';

export interface CounterConfig {
  name: string;
  help: string;
  labelNames?: string[];
  labelOptions?: Record<string, string[]>;
}

export class PromMetricCounter {
  private readonly labelCombinations: Record<string, string>[];
  private counter: Counter;

  constructor(counterConfig: CounterConfig) {
    promAgent.registerMetric(counterConfig.name);

    // Check either both or neither labelNames and labelOptions are declared
    if (
      (counterConfig.labelNames && !counterConfig.labelOptions) ||
      (!counterConfig.labelNames && counterConfig.labelOptions)
    ) {
      throw new Error(
        `Error: Counter Metric "${counterConfig.name}" must have both labelNames and labelOptions configured if either is declared.`,
      );
    }

    // Validate labelNames and labelOptions if both provided
    if (counterConfig.labelNames && counterConfig.labelOptions) {
      this.validateLabelNamesAndOptions(
        counterConfig.labelNames,
        counterConfig.labelOptions,
      );
      this.labelCombinations = this.generateLabelCombinations(
        counterConfig.labelOptions,
      );
    }

    this.counter = new promClient.Counter(counterConfig);

    if (this.labelCombinations) {
      this.labelCombinations.forEach((combination) => {
        this.counter.inc(combination, 0);
      });
    }
  }

  private validateLabelNamesAndOptions(
    labelNames: string[],
    labelOptions: Record<string, string[]>,
  ) {
    const labelNamesFromOptions = Object.keys(labelOptions);
    const invalidLabelNamesFromOptions = labelNamesFromOptions.filter(
      (labelName) => !labelNames.includes(labelName),
    );

    if (invalidLabelNamesFromOptions.length > 0) {
      throw new Error(
        `Error: Undeclared labelNames: "${invalidLabelNamesFromOptions}".`,
      );
    }

    const invalidLabelNames = labelNames.filter(
      (labelName) => !labelNamesFromOptions.includes(labelName),
    );
    if (invalidLabelNames.length > 0) {
      throw new Error(
        `Error: labelOptions are not configured for labelNames="${invalidLabelNames}".`,
      );
    }
  }

  private generateLabelCombinations(
    labelOptions?: Record<string, string[]>,
  ): Record<string, string>[] {
    let labelCombinations = [{}];

    Object.keys(labelOptions).forEach((labelName) => {
      // Get current label options
      const options = labelOptions[labelName];

      // Update combinations with new options
      labelCombinations = labelCombinations.flatMap((combination) =>
        options.map((option) => ({
          ...combination,
          [labelName]: option,
        })),
      );
    });

    return labelCombinations;
  }

  public inc(num: number, labels?: Record<string, string>) {
    if (labels) {
      this.validateLabelCombination(labels);
      this.counter.inc(labels, num);
    } else {
      this.counter.inc(num);
    }
  }

  private validateLabelCombination(labelCombination: Record<string, string>) {
    const result = this.labelCombinations.some((item) => {
      return Object.keys(labelCombination).every(
        (key) => item[key] === labelCombination[key],
      );
    });

    if (!result) {
      throw new Error(
        `Invalid labelCombination provided: "${JSON.stringify(
          labelCombination,
        )}".`,
      );
    }
  }
}
