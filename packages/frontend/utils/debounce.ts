// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default <F extends (...args: any[]) => void>(
  func: F,
  wait: number,
  immediate = false,
): ((this: ThisParameterType<F>, ...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout | undefined;

  return function debounced(
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): void {
    const doLater = (): void => {
      timeout = undefined;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;

    if (!timeout) clearTimeout(timeout);

    timeout = setTimeout(doLater, wait);

    if (callNow) func.apply(this, args);
  };
};
