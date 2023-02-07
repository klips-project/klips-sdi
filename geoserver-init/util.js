/**
 * Sleeps for the provided count of seconds.
 *
 * @param {Number} seconds The count of seconds to wait
 */
export const sleep = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};
