// lib/data/products/index/services/rate-limit.ts

export const createLimit = (concurrency: number) => {
  let running = 0;
  const queue: Array<() => void> = [];

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        running++;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          running--;
          if (queue.length > 0 && running < concurrency) {
            const next = queue.shift();
            if (next) next();
          }
        }
      };

      if (running < concurrency) {
        execute();
      } else {
        queue.push(execute);
      }
    });
  };
};
