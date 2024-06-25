import os from 'os';
import { PromMetricGauge } from './promMetricGauge';

// const cpuUsageMetric = new PromMetricGauge(
//   `cpu_milliseconds_total`,
//   `Total milliseconds CPU has run since program initiated.`,
//   ['type'],
// );

function collectSystemMetrics() {
  const cpus = os.cpus();
  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;

  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }

  const total = user + nice + sys + idle + irq;
  const idlePercentage = (idle / total) * 100;
  const usagePercentage = 100 - idlePercentage;

  console.log(usagePercentage);

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usageMemPercentage = (usedMem / totalMem) * 100;

  console.log(totalMem);
  console.log(usedMem);
  console.log(usageMemPercentage);
}
