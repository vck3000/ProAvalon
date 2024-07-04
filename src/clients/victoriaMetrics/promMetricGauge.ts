import promClient, { Gauge } from 'prom-client';
import { promAgent } from './promAgent';
import {
  generateLabelCombinations,
  validateLabelNamesAndOptions,
} from './metricFunctions';

interface GaugeConfig {
  name: string;
  help: string;
  labelNames?: string[];
  labelOptions?: Record<string, string[]>;
  collect?: () => void; // Refer to prom-client docs on how this should be used.
}

export class PromMetricGauge {
  private readonly labelCombinations: Record<string, string>[];
  private gauge: Gauge;

  constructor(gaugeConfig: GaugeConfig) {
    promAgent.registerMetric(gaugeConfig.name);

    // Check either both or neither labelNames and labelOptions are declared
    if (
      (gaugeConfig.labelNames && !gaugeConfig.labelOptions) ||
      (!gaugeConfig.labelNames && gaugeConfig.labelOptions)
    ) {
      throw new Error(
        `Error: Counter Metric "${gaugeConfig.name}" must have both labelNames and labelOptions configured if either is declared.`,
      );
    }

    // Validate labelNames and labelOptions if both provided
    if (gaugeConfig.labelNames && gaugeConfig.labelOptions) {
      validateLabelNamesAndOptions(
        gaugeConfig.labelNames,
        gaugeConfig.labelOptions,
      );
      this.labelCombinations = generateLabelCombinations(
        gaugeConfig.labelOptions,
      );
    }

    this.gauge = new promClient.Gauge(gaugeConfig);
  }
}
