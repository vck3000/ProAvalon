import promClient, { Counter } from 'prom-client';
import { promAgent } from './promAgent';

interface CounterConfig {
  name: string;
  help: string;
  labelNames?: string[];
}

export class PromMetricCounter {
  private counter: Counter;
  private labelNames: string[];

  constructor(counterConfig: CounterConfig) {
    promAgent.registerMetric(counterConfig.name);

    this.counter = new promClient.Counter(counterConfig);
    this.labelNames = counterConfig.labelNames;
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
