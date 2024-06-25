import promClient from 'prom-client';
import { sendToDiscordAdmins } from '../discord';

const MAX_PUSH_METRICS_ERRORS = 5;
const PUSH_METRICS_ERRORS_RATE_LIMIT = 60 * 60 * 1000; // 1 hour

export class PromAgent {
  private metricNames: Set<string>;
  private pushMetricsErrorsTimestamps: number[] = [];

  constructor() {
    this.metricNames = new Set<string>();
  }

  public addMetricName(metricName: string) {
    if (!this.metricNames.has(metricName)) {
      this.metricNames.add(metricName);
      return;
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error(`Error metric name already exists: ${metricName}`);
      process.exit(1);
    } else {
      // TODO-kev: Error message below okay?
      throw new Error(`Error metric name already exists: ${metricName}`);
    }
  }

  // TODO-kev: Below is purely for testing. Keep or remove?
  public getMetricNames(): Set<string> {
    return this.metricNames;
  }

  public async pushMetrics() {
    const metrics = await promClient.register.metrics(); // Will call any collect() functions for gauges

    const response = await fetch(process.env.VM_IMPORT_PROMETHEUS_URL, {
      method: 'POST',
      body: metrics,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      const errMsg = `Failed to push metrics: status=${response.status} text=${response.statusText}`;
      console.error(errMsg);

      // Alert Discord while errors are less than MAX_PUSH_METRICS_ERRORS
      const now = Date.now();
      this.pushMetricsErrorsTimestamps.push(now);

      let count = 0;

      while (
        count < this.pushMetricsErrorsTimestamps.length &&
        now - this.pushMetricsErrorsTimestamps[count] >=
          PUSH_METRICS_ERRORS_RATE_LIMIT
      ) {
        count++;
      }

      this.pushMetricsErrorsTimestamps =
        this.pushMetricsErrorsTimestamps.slice(count);

      // TODO-kev: Check below. Particularly error stack?. Consider what to do in cases where it exceeds
      if (this.pushMetricsErrorsTimestamps.length <= MAX_PUSH_METRICS_ERRORS) {
        sendToDiscordAdmins(errMsg);
      }
    }

    // TODO-kev: Delete
    console.log('Successfully pushed metrics.');
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
