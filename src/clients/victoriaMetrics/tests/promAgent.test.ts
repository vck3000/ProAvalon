import { PromAgent } from '../promAgent';

describe('PromAgent', () => {
  let promAgent: PromAgent;
  let dupeMetricErrorHandler: jest.Mock;

  beforeEach(() => {
    dupeMetricErrorHandler = jest.fn();
    promAgent = new PromAgent(dupeMetricErrorHandler);
  });

  it(`Adds unique metric names.`, () => {
    promAgent.registerMetric('metric_name_1');
    promAgent.registerMetric('metric_name_2');

    expect(dupeMetricErrorHandler).not.toHaveBeenCalled();
  });

  it('Throws an error when adding a duplicate metric name.', () => {
    promAgent.registerMetric('metric_name_1');
    promAgent.registerMetric('metric_name_1');

    expect(dupeMetricErrorHandler).toHaveBeenCalledTimes(1);
  });
});
