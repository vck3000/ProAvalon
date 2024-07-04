import promClient, { Counter } from 'prom-client';
import { promAgent } from './promAgent';
import {
  generateLabelCombinations,
  validateLabelNamesAndOptions,
} from './metricFunctions';

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
      validateLabelNamesAndOptions(
        counterConfig.labelNames,
        counterConfig.labelOptions,
      );
      this.labelCombinations = generateLabelCombinations(
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
