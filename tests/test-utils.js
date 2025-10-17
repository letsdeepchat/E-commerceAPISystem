import { MongoMemoryServer } from 'mongodb-memory-server';

export async function startMemoryServer() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const stop = async () => {
    await mongod.stop();
  };
  return { uri, stop };
}
