import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';

interface GaugeConfig {
  name: string;
  help: string;
  labelNames?: string[];
  collect?: () => void; // Refer to prom-client docs on how this should be configured
}

export class PromMetricGauge {
  private gauge: Gauge;

  constructor(gaugeConfig: GaugeConfig) {
    promAgent.registerMetric(gaugeConfig.name);

    this.gauge = new promClient.Gauge(gaugeConfig);
  }
}
