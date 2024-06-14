import { PromAgent } from '../promAgent';

describe('PromAgent', () => {
  let promAgent: PromAgent;

  beforeEach(() => {
    promAgent = new PromAgent();
  });

  it(`Adds unique metric names.`, () => {
    expect(() => {
      promAgent.addMetricName('metric_name_1');
      promAgent.addMetricName('metric_name_2');
    }).not.toThrow();

    expect(promAgent.getMetricNames().has('metric_name_1'));
    expect(promAgent.getMetricNames().has('metric_name_2'));
  });

  it('Throws an error when adding a duplicate metric name.', () => {
    expect(() => {
      promAgent.addMetricName('metric_name_1');
      promAgent.addMetricName('metric_name_1');
    }).toThrow();
  });
});
