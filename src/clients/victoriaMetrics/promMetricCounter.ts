import promClient, { Counter } from 'prom-client';
import { promAgent } from './promAgent';

interface CounterConfig {
  name: string;
  help: string;
  labelNames?: string[];
  labelOptions?: Record<string, string[]>;
}

export class PromMetricCounter {
  private counter: Counter;
  private labelNames: string[];
  private labelOptions: Record<string, string[]>;

  constructor(counterConfig: CounterConfig) {
    promAgent.registerMetric(counterConfig.name);

    this.counter = new promClient.Counter(counterConfig);
    this.labelNames = counterConfig.labelNames;
    this.labelOptions = counterConfig.labelOptions;

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
      const labelNamesFromOptions = Object.keys(counterConfig.labelOptions);
      const invalidLabelNamesFromOptions = labelNamesFromOptions.filter(
        (labelName) => !counterConfig.labelNames.includes(labelName),
      );

      if (invalidLabelNamesFromOptions.length > 0) {
        throw new Error(
          `Error: labelNames cannot be used if undeclared: "${invalidLabelNamesFromOptions}".`,
        );
      }

      const invalidConfigLabelNames = counterConfig.labelNames.filter(
        (labelName) => !labelNamesFromOptions.includes(labelName),
      );
      if (invalidConfigLabelNames.length > 0) {
        throw new Error(
          `Error: labelOptions are not configured for labelNames="${invalidConfigLabelNames}".`,
        );
      }

      let labelCombinations = [{}];

      labelNamesFromOptions.forEach((labelName) => {
        // Get current label options
        const options = this.labelOptions[labelName];

        // Update combinations with new options
        labelCombinations = labelCombinations.flatMap((combination) =>
          options.map((option) => ({
            ...combination,
            [labelName]: option,
          })),
        );
      });

      labelCombinations.forEach((combination) => {
        this.counter.inc(combination, 0);
      });
    }
  }

  public inc(num: number, labels?: Record<string, string>) {
    if (labels) {
      this.validateLabels(labels);
      this.counter.inc(labels, num);
    } else {
      this.counter.inc(num);
    }
  }

  private validateLabels(labels: Record<string, string>) {
    const invalidLabels = Object.keys(labels).filter(
      (label) => !this.labelNames.includes(label),
    );

    if (invalidLabels.length > 0) {
      throw new Error(`Invalid labels provided: ${invalidLabels.join(', ')}.`);
    }
  }
}
