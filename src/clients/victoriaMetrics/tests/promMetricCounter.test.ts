import { Counter, CounterConfiguration } from 'prom-client';
import { promAgent } from '../promAgent';
import { CounterConfig, PromMetricCounter } from '../promMetricCounter';

promAgent.registerMetric = jest.fn();
const incMock = jest.fn();

jest.mock('prom-client', () => ({
  Counter: jest.fn().mockImplementation(() => ({
    inc: incMock,
  })),
}));

describe('PromMetricCounter', () => {
  describe('Constructor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should register the metric name with promAgent and initialise the metric.', () => {
      new PromMetricCounter({
        name: 'test_counter1',
        help: 'A test counter.',
      });

      const expectedConfig1: CounterConfiguration<string> = {
        name: 'test_counter1',
        help: 'A test counter.',
      };

      expect(promAgent.registerMetric).toHaveBeenCalledWith('test_counter1');
      expect(Counter).toHaveBeenCalledWith(expectedConfig1);

      new PromMetricCounter({
        name: 'test_counter2',
        help: 'A test counter.',
        labelOptions: {
          status: new Set(['finished', 'voided']),
          colour: new Set(['black', 'white']),
        },
      });

      const expectedConfig2: CounterConfiguration<string> = {
        name: 'test_counter2',
        help: 'A test counter.',
        labelNames: ['status', 'colour'],
      };

      expect(promAgent.registerMetric).toHaveBeenCalledWith('test_counter2');
      expect(Counter).toHaveBeenCalledWith(expectedConfig2);
    });

    it('should throw an error for empty labelOptions.', () => {
      const counterConfig: CounterConfig = {
        name: 'test_counter',
        help: 'A test counter.',
        labelOptions: {},
      };

      expect(() => new PromMetricCounter(counterConfig)).toThrow();
    });

    it('should throw an error for missing labelOptions.', () => {
      const counterConfig: CounterConfig = {
        name: 'test_counter',
        help: 'A test counter.',
        labelOptions: { status: new Set(['yes', 'no']), empty: new Set() },
      };

      expect(() => new PromMetricCounter(counterConfig)).toThrow();
    });

    it('initialise all metric combinations where labelOptions are present.', () => {
      new PromMetricCounter({
        name: 'test_counter',
        help: 'A test counter.',
        labelOptions: {
          status: new Set(['finished', 'voided']),
          colour: new Set(['black', 'white']),
        },
      });

      const expectedConfig: CounterConfiguration<string> = {
        name: 'test_counter',
        help: 'A test counter.',
        labelNames: ['status', 'colour'],
      };

      expect(promAgent.registerMetric).toHaveBeenCalledWith('test_counter');
      expect(Counter).toHaveBeenCalledWith(expectedConfig);

      const labelCombinations = [
        { status: 'finished', colour: 'black' },
        { status: 'finished', colour: 'white' },
        { status: 'voided', colour: 'black' },
        { status: 'voided', colour: 'white' },
      ];

      expect(incMock).toHaveBeenCalledTimes(4);

      labelCombinations.forEach((combination) => {
        expect(incMock).toHaveBeenCalledWith(combination, 0);
      });
    });
  });

  describe('Increment', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should increment metrics.', () => {
      const testMetric = new PromMetricCounter({
        name: 'test_counter',
        help: 'A test counter.',
      });

      testMetric.inc(2);

      expect(incMock).toHaveBeenCalledWith(2);

      const testMetric2 = new PromMetricCounter({
        name: 'test_counter2',
        help: 'A test counter.',
        labelOptions: {
          status: new Set(['yes', 'no']),
        },
      });

      testMetric2.inc(2, { status: 'yes' });
      testMetric2.inc(2, { status: 'no' });

      expect(incMock).toHaveBeenCalledWith({ status: 'yes' }, 2);
      expect(incMock).toHaveBeenCalledWith({ status: 'no' }, 2);
    });

    it('should not increment invalid metrics.', () => {
      const testMetric = new PromMetricCounter({
        name: 'test_counter',
        help: 'A test counter.',
        labelOptions: {
          status: new Set(['yes', 'no']),
          color: new Set(['red', 'white']),
        },
      });

      // Labels are not used yet they were declared
      expect(() => testMetric.inc(2)).toThrow();

      // Not all label names are used
      expect(() => testMetric.inc(2, { status: 'yes' })).toThrow();

      // Label name not declared
      expect(() => testMetric.inc(2, { fake_label: 'yes' })).toThrow();

      // Incorrect label option used
      expect(() => testMetric.inc(2, { status: 'fake_status' })).toThrow();
    });
  });
});
