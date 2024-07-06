import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';

export interface GaugeConfig {
  name: string;
  help: string;
  labelOptions?: Record<string, Set<string>>;
  collect?: () => void; // Refer to prom-client docs on how this should be used.
}

export interface PromClientGaugeConfig {
  name: string;
  help: string;
  labelNames?: string[];
  collect?: () => void;
}

export class PromMetricGauge {
  private readonly labelOptions: Record<string, Set<string>>;
  private gauge: Gauge;

  constructor(gaugeConfig: GaugeConfig) {
    promAgent.registerMetric(gaugeConfig.name);

    if (!gaugeConfig.labelOptions) {
      this.gauge = new promClient.Gauge({
        name: gaugeConfig.name,
        help: gaugeConfig.help,
        collect: gaugeConfig.collect,
      });
    } else {
      if (Object.keys(gaugeConfig.labelOptions).length === 0) {
        throw new Error('LabelOptions are declared but undefined.');
      }

      for (const labelName in gaugeConfig.labelOptions) {
        if (gaugeConfig.labelOptions[labelName].size === 0) {
          throw new Error(
            `LabelOptions are undefined for labelName: "${labelName}".`,
          );
        }
      }

      // Initialise gauge metric
      this.labelOptions = gaugeConfig.labelOptions;
      this.gauge = new promClient.Gauge({
        name: gaugeConfig.name,
        help: gaugeConfig.help,
        labelNames: Object.keys(gaugeConfig.labelOptions),
        collect: gaugeConfig.collect,
      });

      this.gauge = new promClient.Gauge(gaugeConfig);
    }
  }
}
