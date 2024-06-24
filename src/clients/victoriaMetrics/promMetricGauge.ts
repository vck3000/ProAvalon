import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';

export class PromMetricGauge {
  private gauge: Gauge;

  constructor(name: string, help: string, collect?: () => void) {
    promAgent.addMetricName(name);
    this.gauge = new promClient.Gauge({ name, help, collect });
  }
}
