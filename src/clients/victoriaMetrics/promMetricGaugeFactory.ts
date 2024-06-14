import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';

export class PromMetricGaugeFactory {
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

  public gaugeSet(num: number) {
    this.gauge.set(num);
  }

  public gaugeInc(num: number) {
    this.gauge.inc(num);
  }

  public gaugeDec(num: number) {
    this.gauge.dec(num);
  }
}
