import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async function(host = 'host.docker.internal'): Promise<Connection> {
  const options = await getConnectionOptions();

  return createConnection(
    Object.assign(options, {
      host,
      database: process.env.NODE_ENV === 'test'
        ? 'fin_api_test'
        : options.database
    }),
  );
};
