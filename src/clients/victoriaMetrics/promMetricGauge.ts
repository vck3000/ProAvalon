import promClient, { Gauge } from 'prom-client';
import { isValidLabelCombination } from './metricFunctions';
import { promAgent } from './promAgent';

export interface GaugeConfig {
  name: string;
  help: string;
  labelOptions?: Record<string, Set<string>>;
  collect?: () => void; // Refer to prom-client docs on how this should be used.
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
        collect: gaugeConfig.collect
          ? gaugeConfig.collect.bind(this)
          : undefined,
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
        collect: gaugeConfig.collect
          ? gaugeConfig.collect.bind(this)
          : undefined,
      });
    }
  }

  public set(num: number, labels?: Record<string, string>) {
    if (this.labelOptions && !labels) {
      throw new Error('Labels were not provided.');
    }

    if (labels) {
      if (!isValidLabelCombination(this.labelOptions, labels)) {
        throw new Error(`Invalid labels provided: ${JSON.stringify(labels)}`);
      }
      this.gauge.set(labels, num);
    } else {
      this.gauge.set(num);
    }
  }
}
