import promClient, { Counter } from 'prom-client';
import { promAgent } from './promAgent';
import { generateLabelCombinations } from './metricFunctions';

export interface CounterConfig {
  name: string;
  help: string;
  labelOptions?: Record<string, Set<string>>;
}

export interface PromClientCounterConfig {
  name: string;
  help: string;
  labelNames?: string[];
}

export class PromMetricCounter {
  private readonly labelOptions: Record<string, Set<string>>;
  private counter: Counter;

  constructor(counterConfig: CounterConfig) {
    promAgent.registerMetric(counterConfig.name);

    if (!counterConfig.labelOptions) {
      this.counter = new promClient.Counter({
        name: counterConfig.name,
        help: counterConfig.help,
      });
    } else {
      if (Object.keys(counterConfig.labelOptions).length === 0) {
        throw new Error('LabelOptions are declared but undefined.');
      }

      for (const labelName in counterConfig.labelOptions) {
        if (counterConfig.labelOptions[labelName].size === 0) {
          throw new Error(
            `LabelOptions are undefined for labelName: "${labelName}".`,
          );
        }
      }

      // Initialise counter metric
      this.labelOptions = counterConfig.labelOptions;
      this.counter = new promClient.Counter({
        name: counterConfig.name,
        help: counterConfig.help,
        labelNames: Object.keys(counterConfig.labelOptions),
      });

      // Increment each labelCombination by 0 to initiate metric
      generateLabelCombinations(counterConfig.labelOptions).forEach(
        (combination) => {
          this.counter.inc(combination, 0);
        },
      );
    }
  }

  public inc(num: number, labels?: Record<string, string>) {
    if (this.labelOptions && !labels) {
      throw new Error('Labels were not provided.');
    }

    if (labels) {
      if (!this.isValidLabelCombination(labels)) {
        throw new Error(`Invalid labels provided: ${JSON.stringify(labels)}`);
      }
      this.counter.inc(labels, num);
    } else {
      this.counter.inc(num);
    }
  }

  // Valid label combinations have a corresponding value for each label name
  private isValidLabelCombination(
    labelCombination: Record<string, string>,
  ): boolean {
    // Key size does not match
    if (
      Object.keys(labelCombination).length !==
      Object.keys(this.labelOptions).length
    ) {
      return false;
    }

    for (const labelName in labelCombination) {
      // label name is not in config
      if (!(labelName in this.labelOptions)) {
        return false;
      }

      // Option not present under the label name
      if (!this.labelOptions[labelName].has(labelCombination[labelName])) {
        return false;
      }
    }

    return true;
  }
}
