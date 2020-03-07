/**
 * limits your function to be called at most every W milliseconds, where W is wait.
 * Calls over W get dropped.
 * https://medium.com/@pat_migliaccio/rate-limiting-throttling-consecutive-function-calls-with-queues-4c9de7106acc
 * @param fn
 * @param wait
 * @example let throttledFunc = throttle(myFunc, 500);
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default (fn: Function, wait: number) => {
  let isCalled = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any): void => {
    if (!isCalled) {
      fn(...args);
      isCalled = true;
      setTimeout(() => {
        isCalled = false;
      }, wait);
    }
  };
};
