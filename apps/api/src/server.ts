import { buildApp } from './app';
import { parseServerEnv } from '@sarira/config';

const env = parseServerEnv(process.env);
const app = await buildApp();

const close = async (signal: string) => {
  app.log.info({ signal }, 'Graceful shutdown');
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', () => void close('SIGTERM'));
process.on('SIGINT', () => void close('SIGINT'));

await app.listen({ host: env.HOST, port: env.PORT });
