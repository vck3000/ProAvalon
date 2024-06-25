import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';

interface GaugeConfig {
  name: string;
  help: string;
  labelNames?: string[];
  collect?: () => void;
}

export class PromMetricGauge {
  private gauge: Gauge;

  constructor(gaugeConfig: GaugeConfig) {
    promAgent.addMetricName(gaugeConfig.name);
    this.gauge = new promClient.Gauge(gaugeConfig);
  }

  public set(val: number, labels?: Record<string, string>) {
    if (!labels) {
      this.gauge.set(val);
    } else {
      this.gauge.set(labels, val); // TODO-kev: Note an error is naturally thrown when creating labels not originally defined
    }
  }
}
