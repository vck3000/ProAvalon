import os from 'os';
import { PromMetricGauge } from './promMetricGauge';

const cpuIdleUsageMetric = new PromMetricGauge({
  name: `cpu_idle_seconds_total`,
  help: `Total milliseconds CPU has run in idle mode since program initiated.`,
  collect() {
    let totalIdleMilliseconds = 0;
    const cpus = os.cpus();

    for (let cpu of cpus) {
      totalIdleMilliseconds += cpu.times.idle;
    }

    this.set(totalIdleMilliseconds / 1000);
  },
});

const cpuTotalUsageMetric = new PromMetricGauge({
  name: `cpu_seconds_total`,
  help: `Total milliseconds CPU has run in all modes since program initiated.`,
  collect() {
    let totalMilliseconds = 0;
    const cpus = os.cpus();

    for (let cpu of cpus) {
      totalMilliseconds +=
        cpu.times.user +
        cpu.times.nice +
        cpu.times.sys +
        cpu.times.idle +
        cpu.times.irq;
    }

    this.set(totalMilliseconds / 1000);
  },
});

const memoryUsedMetric = new PromMetricGauge({
  name: `memory_bytes`,
  help: `Total memory available.`,
  labelNames: ['type'],
  collect() {
    this.set(os.totalmem() - os.freemem());
  },
});

const memoryTotalMetric = new PromMetricGauge({
  name: `memory_bytes`,
  help: `Total memory available.`,
  labelNames: ['type'],
  collect() {
    this.set(os.totalmem());
  },
});
