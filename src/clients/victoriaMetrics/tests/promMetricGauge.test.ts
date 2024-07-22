const setMock = jest.fn();
const GaugeMock = jest.fn().mockImplementation(() => ({
  set: setMock,
}));

import { Gauge } from 'prom-client';
import { promAgent } from '../promAgent';
import { GaugeConfig, PromMetricGauge } from '../promMetricGauge';

promAgent.registerMetric = jest.fn();

jest.mock('prom-client', () => ({
  Gauge: GaugeMock,
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

      function mockCollectFn() {
        this.set(123, { status: 'finished', colour: 'black' });
      }

      new PromMetricGauge({
        name: 'test_gauge2',
        help: 'A test gauge.',
        labelOptions: {
          status: new Set(['finished', 'voided']),
          colour: new Set(['black', 'white']),
        },
        collect: mockCollectFn,
      });

      expect(promAgent.registerMetric).toHaveBeenCalledWith('test_gauge2');
      expect(GaugeMock).toHaveBeenCalledWith({
        name: 'test_gauge2',
        help: 'A test gauge.',
        labelNames: ['status', 'colour'],
        collect: expect.any(Function),
      });

      expect(setMock).not.toHaveBeenCalled();

      GaugeMock.mock.calls[1][0].collect();

      expect(setMock).toHaveBeenCalledWith(
        { status: 'finished', colour: 'black' },
        123,
      );
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

  describe('Set', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should set valid metrics.', () => {
      const testMetric = new PromMetricGauge({
        name: 'test_gauge1',
        help: 'A test gauge.',
      });

      testMetric.set(2);

      expect(setMock).toHaveBeenCalledWith(2);

      const testMetric2 = new PromMetricGauge({
        name: 'test_gauge2',
        help: 'A test gauge.',
        labelOptions: {
          status: new Set(['yes', 'no']),
        },
      });

      testMetric2.set(2, { status: 'yes' });
      testMetric2.set(2, { status: 'no' });

      expect(setMock).toHaveBeenCalledWith({ status: 'yes' }, 2);
      expect(setMock).toHaveBeenCalledWith({ status: 'no' }, 2);
    });

    it('should not set invalid metrics.', () => {
      const testMetric = new PromMetricGauge({
        name: 'test_gauge',
        help: 'A test gauge.',
        labelOptions: {
          status: new Set(['yes', 'no']),
          color: new Set(['red', 'white']),
        },
      });

      // Labels are not used yet they were declared
      expect(() => testMetric.set(2)).toThrow();

      // Labels are not used yet they were declared
      expect(() => testMetric.set(2)).toThrow();

      // Not all label names are used
      expect(() => testMetric.set(2, { status: 'yes' })).toThrow();

      // Label name not declared
      expect(() => testMetric.set(2, { fake_label: 'yes' })).toThrow();
    });
  });
});
