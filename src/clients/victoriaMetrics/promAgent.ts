// TODO-kev: Think of a new name to call this file

import promClient, { Counter, Gauge } from 'prom-client';
import assert from 'assert';

const VM_IMPORT_PROMETHEUS_URL =
  'http://localhost:8428/api/v1/import/prometheus';

class PromAgent {
  private metricNames: Set<string>;

  constructor() {
    this.metricNames = new Set<string>();

    new promClient.Counter({
      name: 'test_counter',
      help: 'Help message',
    });
  }

  public addMetric(metricName: string) {
    assert(
      !this.metricNames.has(metricName),
      `Metric name already exists: ${metricName}`,
    );

    this.metricNames.add(metricName);
  }

  // public incrementCounter(counterName: CounterName, num: number) {
  //   const counter: Counter<string> = promClient.register.getSingleMetric(
  //     counterName,
  //   ) as Counter<string>;
  //
  //   if (!counter) {
  //     throw new Error(`Metric counter does not exist: ${counterName}`);
  //   }
  //
  //   counter.inc(num);
  // }

  public async pushMetricsToVictoriaMetrics() {
    const metrics = await promClient.register.metrics(); // Will call any collect() functions for gauges

    // TODO-kev: should i do try/catch, will it crash program, how to repush?
    const response = await fetch(VM_IMPORT_PROMETHEUS_URL, {
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

    // TODO-kev: Error logging purposes, remove later
    const responseBody = await response.text();
    console.log(
      'Response:',
      response.status,
      response.statusText,
      responseBody,
    );
  }

  // TODO-kev: Delete
  public async getMetric(metricName: string) {
    return await promClient.register.getSingleMetricAsString(metricName);
  }

  // TODO-kev: Delete
  public async test() {
    const metrics = await promClient.register.metrics(); // Will call any collect() functions for gauges
    // const currentTimestamp = Date.now();
    //
    // const metricsWithTimestamp = metrics
    //   .split('\n')
    //   .map((line: string) => {
    //     // Ignore comment lines and empty lines
    //     if (line.startsWith('#') || line.trim() === '') {
    //       return line;
    //     }
    //     return `${line} ${currentTimestamp}`;
    //   })
    //   .join('\n');
    //
    // console.log(metricsWithTimestamp);

    console.log(metrics);

    // Reset metrics
    // await promClient.register.resetMetrics();
  }
}

export const promAgent = new PromAgent();
