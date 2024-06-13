// TODO-kev: Think of a new name to call this file

import promClient, { Counter, Gauge } from 'prom-client';
import { allSockets } from '../../sockets/sockets';
import assert from 'assert';

export const counters = {
  TEST: 'test_counter',
  AVATAR_SUBMISSIONS: 'custom_avatar_submissions_total',
};

export const gauges = {
  PLAYERS_ONLINE: 'players_online_total',
};

type CounterName = typeof counters[keyof typeof counters];
type GaugeName = typeof gauges[keyof typeof gauges];

const VM_IMPORT_PROMETHEUS_URL =
  'http://localhost:8428/api/v1/import/prometheus';

class PromAgent {
  private metricNames: Set<string>;

  constructor() {
    this.metricNames = new Set<string>();

    new promClient.Gauge({
      name: 'players_online_total',
      help: 'Number of players online in the lobby.',
      collect() {
        this.set(allSockets.length); // TODO-kev: Better way to do this?
      },
    });

    new promClient.Counter({
      name: 'test_counter',
      help: 'Help message',
    });

    new promClient.Counter({
      name: 'custom_avatar_submissions_total',
      help: 'Number of custom avatar submissions.',
    });
  }

  public addMetric(metricName: string) {
    assert(
      !this.metricNames.has(metricName),
      `Metric name already exists: ${metricName}`,
    );

    this.metricNames.add(metricName);
  }

  public incrementCounter(counterName: CounterName, num: number) {
    const counter: Counter<string> = promClient.register.getSingleMetric(
      counterName,
    ) as Counter<string>;

    if (!counter) {
      throw new Error(`Metric counter does not exist: ${counterName}`);
    }

    counter.inc(num);
  }

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
  public async getMetric(metricName: CounterName | GaugeName) {
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

    // console.log(metrics);

    // Reset metrics
    // await promClient.register.resetMetrics();
  }
}

export const promAgent = new PromAgent();
