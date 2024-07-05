import promClient, { Counter } from 'prom-client';
import { promAgent } from './promAgent';

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
  private readonly labelCombinations: Record<string, string>[];
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

    if (counterConfig.labelOptions) {
      // TODO-kev: Needs to be fixed
      // this.labelCombinations = generateLabelCombinations(
      //   counterConfig.labelOptions,
      // );
    }

    this.counter = new promClient.Counter(promClientCounterConfig);

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
