import redis from 'redis';

const client = redis.createClient();

client.on('connect', () => {
  console.log('Redis client connected to the server');
});
client.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

// Subscribe to the channel
const channel = 'holberton school channel';
client.subscribe(channel);

// Handle incoming messages
client.on('message', (channel, message) => {
  console.log(`Received message: ${message}`);

  if (message === 'KILL_SERVER') {
    client.unsubscribe();
    client.quit();
  }
});
