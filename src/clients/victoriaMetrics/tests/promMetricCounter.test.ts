import { promAgent } from '../promAgent';
import {
  CounterConfig,
  PromClientCounterConfig,
  PromMetricCounter,
} from '../promMetricCounter';

// Create mocks for promAgent and promClient.Counter
promAgent.registerMetric = jest.fn();

jest.mock('prom-client', () => ({
  Counter: jest.fn().mockImplementation(() => ({
    inc: jest.fn(), // Mock the inc method
  })),
}));

import { Counter } from 'prom-client';

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

      const expectedConfig1: PromClientCounterConfig = {
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

      const expectedConfig2: PromClientCounterConfig = {
        name: 'test_counter2',
        help: 'A test counter.',
        labelNames: ['status', 'colour'],
      };

      expect(promAgent.registerMetric).toHaveBeenCalledWith('test_counter2');
      expect(Counter).toHaveBeenCalledWith(expectedConfig1);
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

    // it('initialise all metric combinations where labelOptions are present.', () => {
    //   new PromMetricCounter({
    //     name: 'test_counter',
    //     help: 'A test counter.',
    //     labelOptions: {
    //       status: new Set(['finished', 'voided']),
    //       colour: new Set(['black', 'white']),
    //     },
    //   });
    //
    //   const expectedConfig: PromClientCounterConfig = {
    //     name: 'test_counter',
    //     help: 'A test counter.',
    //     labelNames: ['status', 'colour'],
    //   };
    //
    //   expect(promAgent.registerMetric).toHaveBeenCalledWith('test_counter');
    //   expect(Counter).toHaveBeenCalledWith(expectedConfig);
    //
    //   const labelCombinations = [
    //     { status: 'finished', colour: 'black' },
    //     { status: 'finished', colour: 'white' },
    //     { status: 'voided', colour: 'black' },
    //     { status: 'voided', colour: 'white' },
    //   ];
    //
    //   console.log('test');
    //   console.log(Counter.inc);
    //
    //   // labelCombinations.forEach((combination) => {
    //   //   expect(MockCounter.mock.instances[0].inc).toHaveBeenCalledWith(
    //   //     combination,
    //   //     0,
    //   //   );
    //   // });
    // });
  });
});
