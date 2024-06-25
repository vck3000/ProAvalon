import os from 'os';
import { PromMetricGauge } from './promMetricGauge';

const cpuUsageMetric = new PromMetricGauge({
  name: `cpu_seconds`,
  help: `Total milliseconds CPU has run since program initiated.`,
  labelNames: ['type'],
});

const memoryUsageMetric = new PromMetricGauge({
  name: `memory_bytes`,
  help: `Total memory available.`,
  labelNames: ['type'],
});

export function collectSystemMetrics() {
  // CPU Usage Metrics
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;

  for (let cpu of cpus) {
    idle += cpu.times.idle;
    total +=
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq;
  }

  cpuUsageMetric.set(total * 1000, { type: 'total' });
  cpuUsageMetric.set(idle * 1000, { type: 'idle' });

  // Memory Usage Metrics
  const usedMem = os.totalmem() - os.freemem();

  memoryUsageMetric.set(os.totalmem(), { type: 'total' });
  memoryUsageMetric.set(usedMem, { type: 'used' });
}
