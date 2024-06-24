import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';

export class PromMetricGauge {
  private gauge: Gauge;

  constructor(name: string, help: string, collect?: () => void) {
    promAgent.addMetricName(name);

    const gaugeConfig: {
      name: string;
      help: string;
      collect?: () => void;
    } = {
      name,
      help,
    };

    if (collect) {
      gaugeConfig.collect = collect;
    }

    this.gauge = new promClient.Gauge(gaugeConfig);
  }
}
