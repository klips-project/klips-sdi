/**
 * Sleeps for the provided number of seconds.
 *
 * @param {Number} seconds
 */
export const sleep = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};
