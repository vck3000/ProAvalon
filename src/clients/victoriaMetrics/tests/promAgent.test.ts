import { PromAgent } from '../promAgent';

describe('PromAgent', () => {
  let promAgent: PromAgent;

  beforeEach(() => {
    const dupeMetricErrorHandler = (metricName: string) => {
      throw new Error(`Error metric name already exists: ${metricName}`);
    };

    promAgent = new PromAgent(dupeMetricErrorHandler);
  });

  it(`Adds unique metric names.`, () => {
    expect(() => {
      promAgent.registerMetric('metric_name_1');
      promAgent.registerMetric('metric_name_2');
    }).not.toThrow();
  });

  it('Throws an error when adding a duplicate metric name.', () => {
    expect(() => {
      promAgent.registerMetric('metric_name_1');
      promAgent.registerMetric('metric_name_1');
    }).toThrow();
  });
});
