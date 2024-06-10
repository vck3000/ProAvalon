// TODO-kev: Think of a new name to call this file

import promClient, { Counter } from 'prom-client';

const counters = {
  TEST_COUNTER: 'test_counter',
};

class PromAgent {
  constructor() {
    new promClient.Counter({
      name: 'test_counter',
      help: 'This is a test counter',
    });

    new promClient.Counter({
      name: 'test_counter2',
      help: 'This is a test counter again',
    });
  }

  public async incrementCounter(counterName: string, num: number) {
    const counter = (await promClient.register.getSingleMetric(
      counterName,
    )) as Counter<string>;

    if (!counter) {
      throw new Error(`Metric counter does not exist: ${counterName}`);
    }

    counter.inc(num);

    return;
  }

  public async test() {
    const metrics = await promClient.register.metrics();
    const metricssdfsf = await promClient.register;

    console.log(metrics);
    // console.log(promClient.register.getSingleMetric('test_counter2').get());
  }
}

export const promAgent = new PromAgent();
