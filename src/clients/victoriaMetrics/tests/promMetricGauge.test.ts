import { Gauge } from 'prom-client';
import { promAgent } from '../promAgent';
import { GaugeConfig, PromMetricGauge } from '../promMetricGauge';

promAgent.registerMetric = jest.fn();

jest.mock('prom-client', () => ({
  Gauge: jest.fn().mockImplementation(),
}));

describe('PromMetric Gauge', () => {
  describe('Constructor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should register the metric name with promAgent and initialise the metric.', () => {
      new PromMetricGauge({
        name: 'test_gauge1',
        help: 'A test gauge.',
      });

      expect(promAgent.registerMetric).toHaveBeenCalledWith('test_gauge1');
      expect(Gauge).toHaveBeenCalledWith({
        name: 'test_gauge1',
        help: 'A test gauge.',
      });

      new PromMetricGauge({
        name: 'test_gauge2',
        help: 'A test gauge.',
        labelOptions: {
          status: new Set(['finished', 'voided']),
          colour: new Set(['black', 'white']),
        },
        collect() {
          this.set(1);
        },
      });

      expect(promAgent.registerMetric).toHaveBeenCalledWith('test_gauge2');
      expect(Gauge).toHaveBeenCalledWith({
        name: 'test_gauge2',
        help: 'A test gauge.',
        labelNames: ['status', 'colour'],
        collect() {
          this.set(1);
        },
      });
    });

    it('should throw an error for empty labelOptions.', () => {
      const gaugeConfig: GaugeConfig = {
        name: 'test_gauge',
        help: 'A test gauge.',
        labelOptions: {},
      };

      expect(() => new PromMetricGauge(gaugeConfig)).toThrow();
    });

    it('should throw an error for missing labelOptions.', () => {
      const gaugeConfig: GaugeConfig = {
        name: 'test_gauge',
        help: 'A test gauge.',
        labelOptions: { status: new Set(['yes', 'no']), empty: new Set() },
      };

      expect(() => new PromMetricGauge(gaugeConfig)).toThrow();
    });
  });
});
