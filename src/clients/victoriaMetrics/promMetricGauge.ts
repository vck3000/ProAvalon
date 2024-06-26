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
  private collect: () => void;

  constructor(gaugeConfig: GaugeConfig) {
    promAgent.registerMetric(gaugeConfig.name);

    this.collect = gaugeConfig.collect;
    this.gauge = new promClient.Gauge(gaugeConfig);
  }

  public set(val: number, labels?: Record<string, string>) {
    if (this.collect) {
      console.error(
        `Error gauge metric should not call set when collect exists.`,
      );
    }

    if (!labels) {
      this.gauge.set(val);
    } else {
      this.gauge.set(labels, val); // TODO-kev: Note an error is naturally thrown when creating labels not originally defined
    }
  }
}
