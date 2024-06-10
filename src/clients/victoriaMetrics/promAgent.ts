// TODO-kev: Think of a new name to call this file

import promClient, { Counter } from 'prom-client';

const counters = {
  TEST_COUNTER: 'test_counter',
};

const VM_IMPORT_PROMETHEUS_URL =
  'http://localhost:8428/api/v1/import/prometheus';

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

  public incrementCounter(counterName: string, num: number) {
    // TODO-kev: Consider what if its not a Counter<string>
    const counter = promClient.register.getSingleMetric(
      counterName,
    ) as Counter<string>;

    if (!counter) {
      throw new Error(`Metric counter does not exist: ${counterName}`);
    }

    counter.inc(num);
  }

  public async pushMetricsToVictoriaMetrics() {
    const metrics = await promClient.register.metrics();
    const vmURL = 'http://localhost:8428/api/v1/import/prometheus';

    try {
      const response = await fetch(vmURL, {
        method: 'POST',
        body: metrics,
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to push metrics: ${response.status} - ${response.statusText}`,
        );
      }

      const responseBody = await response.text();
      console.log(
        'Response:',
        response.status,
        response.statusText,
        responseBody,
      );
    } catch (error) {
      console.error('Error pushing metrics:', error); // TODO-kev: should i throw error, will it crash program, how to repush?
    }

    await promClient.register.resetMetrics();
  }

  // TODO-kev: Delete
  public async test() {
    const metrics = await promClient.register.metrics();
    const metricssdfsf = await promClient.register;

    console.log(metrics);
    // console.log(promClient.register.getSingleMetric('test_counter2').get());
  }
}

export const promAgent = new PromAgent();
