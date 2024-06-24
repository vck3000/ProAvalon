import promClient from 'prom-client';
import assert from 'assert';
import { sendToDiscordAdmins } from '../discord';

const VM_IMPORT_PROMETHEUS_URL =
  'http://localhost:8428/api/v1/import/prometheus';

const MAX_PUSH_METRICS_ERRORS = 5;
const PUSH_METRICS_ERRORS_RATE_LIMIT = 60 * 60 * 1000; // 1 hour

export class PromAgent {
  private metricNames: Set<string>;
  private pushMetricsErrorsTimestamps: number[] = [];

  constructor() {
    this.metricNames = new Set<string>();
  }

  public addMetricName(metricName: string) {
    assert(
      !this.metricNames.has(metricName),
      `Metric name already exists: ${metricName}`,
    );

    this.metricNames.add(metricName);
  }

  // TODO-kev: Below is purely for testing. Keep or remove?
  public getMetricNames(): Set<string> {
    return this.metricNames;
  }

  public async pushMetrics() {
    const metrics = await promClient.register.metrics(); // Will call any collect() functions for gauges

    const response = await fetch(VM_IMPORT_PROMETHEUS_URL, {
      method: 'POST',
      body: metrics,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      // TODO-kev: Remove below
      console.log('ERROR PUSHING METRICS');

      // Alert while errors are less than MAX_PUSH_METRICS_ERRORS
      const now = Date.now();
      this.pushMetricsErrorsTimestamps.push(now);
      this.pushMetricsErrorsTimestamps =
        this.pushMetricsErrorsTimestamps.filter(
          (timestamp) => now - timestamp <= PUSH_METRICS_ERRORS_RATE_LIMIT,
        );

      // TODO-kev: Check below. Particularly error stack?. Consider what to do in cases where it exceeds
      if (this.pushMetricsErrorsTimestamps.length <= MAX_PUSH_METRICS_ERRORS) {
        sendToDiscordAdmins(
          `Failed to push metrics: status=${response.status} text=${response.statusText}`,
        );
      }
    } else {
      this.pushMetricsErrorsTimestamps = [];
    }
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
