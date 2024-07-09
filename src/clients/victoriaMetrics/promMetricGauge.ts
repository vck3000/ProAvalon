import promClient, { Gauge } from 'prom-client';
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
        collect: gaugeConfig.collect.bind(this),
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
        collect: gaugeConfig.collect.bind(this),
      });
    }
  }

  public set(num: number, labels?: Record<string, string>) {
    if (this.labelOptions && !labels) {
      throw new Error('Labels were not provided.');
    }

    if (labels) {
      if (!this.isValidLabelCombination(labels)) {
        throw new Error(`Invalid labels provided: ${JSON.stringify(labels)}`);
      }
      this.gauge.set(labels, num);
    } else {
      this.gauge.set(num);
    }
  }

  // Valid label combinations have a corresponding value for each label name
  private isValidLabelCombination(
    labelCombination: Record<string, string>,
  ): boolean {
    // Key size does not match
    if (
      Object.keys(labelCombination).length !==
      Object.keys(this.labelOptions).length
    ) {
      return false;
    }

    for (const labelName in labelCombination) {
      // label name is not in config
      if (!(labelName in this.labelOptions)) {
        return false;
      }

      // Option not present under the label name
      if (!this.labelOptions[labelName].has(labelCombination[labelName])) {
        return false;
      }
    }

    return true;
  }
}
