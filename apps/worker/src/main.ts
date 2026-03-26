import { QueueEvents, Worker } from 'bullmq';
import { parseEnv, workerEnvSchema } from '@oficios/config';

const env = parseEnv(workerEnvSchema, process.env);
const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  password: redisUrl.password || undefined,
  username: redisUrl.username || undefined,
  maxRetriesPerRequest: null,
};

const emailWorker = new Worker(
  'emails',
  async (job) => {
    console.log(`[worker:emails] processing ${job.name}`, job.data);
  },
  { connection },
);

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    console.log(`[worker:notifications] processing ${job.name}`, job.data);
  },
  { connection },
);

const queueEvents = new QueueEvents('notifications', { connection });

queueEvents.on('completed', ({ jobId }) => {
  console.log(`[worker:notifications] completed ${jobId}`);
});

Promise.all([emailWorker.waitUntilReady(), notificationWorker.waitUntilReady(), queueEvents.waitUntilReady()])
  .then(() => {
    console.log('Worker ready');
  })
  .catch((error) => {
    console.error('Worker failed to start', error);
    process.exit(1);
  });
