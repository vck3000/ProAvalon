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

    const promClientCounterConfig: PromClientCounterConfig = {
      name: counterConfig.name,
      help: counterConfig.help,
    };

    if (counterConfig.labelOptions) {
      const labelNames = Object.keys(counterConfig.labelOptions);
      const invalidLabelNames = labelNames.filter((labelName) => {
        return counterConfig.labelOptions[labelName].size === 0;
      });

      if (invalidLabelNames.length > 0) {
        throw new Error(
          `LabelOptions undefined for labelNames: "${invalidLabelNames}".`,
        );
      }

      promClientCounterConfig.labelNames = Object.keys(
        counterConfig.labelOptions,
      );
    }

    this.labelOptions = counterConfig.labelOptions;
    this.counter = new promClient.Counter(promClientCounterConfig);

    // Increment each labelCombination by 0 to initiate metric
    if (counterConfig.labelOptions) {
      const labelCombinations = generateLabelCombinations(
        counterConfig.labelOptions,
      );

      labelCombinations.forEach((combination) => {
        this.counter.inc(combination, 0);
      });
    }
  }

  public inc(num: number, labels?: Record<string, string>) {
    if (labels) {
      if (!this.isValidLabelCombination(labels)) {
        throw new Error(`Invalid labels provided: ${JSON.stringify(labels)}`);
      }
      this.counter.inc(labels, num);
    } else {
      this.counter.inc(num);
    }
  }

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
      if (!this.labelOptions[labelName]) {
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
