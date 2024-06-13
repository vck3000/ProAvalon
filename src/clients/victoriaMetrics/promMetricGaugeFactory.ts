import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';

export class PromMetricGaugeFactory {
  private gauge: Gauge;

  constructor(name: string, help: string) {
    promAgent.addMetric(name);

    this.gauge = new promClient.Gauge({
      name,
      help,
    });
  }
}
