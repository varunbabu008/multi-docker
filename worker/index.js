const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: keys.redisHost,
    port: keys.redisPort
  }
});
const sub = redisClient.duplicate();

// Connect to Redis
(async () => {
  await redisClient.connect();
  await sub.connect();
  
  // Subscribe to insert channel
  await sub.subscribe('insert', (message) => {
    const fibResult = fib(parseInt(message));
    redisClient.hSet('values', message, fibResult);
  });
})();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
sub.on('error', (err) => console.log('Redis Subscriber Error', err));

function fib(index) {
  console.log('Calculating fibonacci for index:', index);
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}
