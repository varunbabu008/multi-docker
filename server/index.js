const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS varun (number INT)')
  .catch(err => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  socket: {
    host: keys.redisHost,
    port: keys.redisPort
  }
});

const redisPublisher = redisClient.duplicate();

// Connect to Redis
(async () => {
  await redisClient.connect();
  await redisPublisher.connect();
})();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisPublisher.on('error', (err) => console.log('Redis Publisher Error', err));

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  try {
    const values = await pgClient.query('SELECT * from varun');
    res.send(values.rows);
  } catch (err) {
    console.error('Error fetching values:', err);
    res.status(500).send('Error fetching values');
  }
});

app.get('/values/current', async (req, res) => {
  try {
    const values = await redisClient.hGetAll('values');
    res.send(values);
  } catch (err) {
    console.error('Error fetching current values:', err);
    res.status(500).send('Error fetching current values');
  }
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  try {
    await redisClient.hSet('values', index, 'Nothing yet!');
    await redisPublisher.publish('insert', index);
    await pgClient.query('INSERT INTO varun(number) VALUES($1)', [index]);
    res.send({ working: true });
  } catch (err) {
    console.error('Error processing value:', err);
    res.status(500).send('Error processing value');
  }
});

app.listen(5000, err => {
  console.log('Listening on port 5000');
});
