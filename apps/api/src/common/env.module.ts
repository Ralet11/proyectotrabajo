import { Global, Module } from '@nestjs/common';
import { parseEnv, apiEnvSchema } from '@oficios/config';

export const API_ENV = 'API_ENV';

const env = parseEnv(apiEnvSchema, process.env);

@Global()
@Module({
  providers: [
    {
      provide: API_ENV,
      useValue: env,
    },
  ],
  exports: [API_ENV],
})
export class EnvModule {}
