import os from 'os';
import { PromMetricGauge } from './promMetricGauge';

const cpuUsageMetric = new PromMetricGauge({
  name: `cpu_milliseconds_total`,
  help: `Total milliseconds CPU has run since program initiated.`,
  labelNames: ['type'],
});

export function collectSystemMetrics() {
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

  cpuUsageMetric.set(total, { type: 'total' });
  cpuUsageMetric.set(idle, { type: 'idle' });

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usageMemPercentage = (usedMem / totalMem) * 100;
}
