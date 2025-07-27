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

// Memory-efficient iterative Fibonacci function
function fib(n) {
  console.log('Calculating fibonacci for index:', n);
  
  if (n < 0) return 0;
  if (n <= 1) return 1;
  
  let prev = 1;
  let current = 1;
  
  for (let i = 2; i <= n; i++) {
    const next = prev + current;
    prev = current;
    current = next;
  }
  
  return current;
}
