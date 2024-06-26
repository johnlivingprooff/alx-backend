import redis from 'redis';
import kue from 'kue';
import express from 'express';
import { promisify } from 'util';

// Create a Redis client
const client = redis.createClient();

// Promisify Redis commands
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const decrAsync = promisify(client.decrby).bind(client);

// Initialize available seats to 50
async function initializeSeats() {
  try {
    await setAsync('available_seats', 50);
  } catch (err) {
    console.error('Failed to initialize seats:', err.message);
  }
}

// Initialize seats when the script starts
initializeSeats();

// Initialize reservationEnabled to true
let reservationEnabled = true;

// Function to reserve a seat
async function reserveSeat(number) {
  const currentSeats = await getCurrentAvailableSeats();
  if (number > currentSeats || !reservationEnabled) {
    throw new Error('No seats available or reservations disabled.');
  }
  await decrAsync('available_seats', number);
}

// Function to get current available seats
async function getCurrentAvailableSeats() {
  const seats = await getAsync('available_seats');
  return seats ? parseInt(seats) : 0;
}

const queue = kue.createQueue();

queue.process('reserve_seat', async (job, done) => {
  try {
    await reserveSeat(job.data.number);
    console.log(`Seat reservation job ${job.id} completed`);
    done(null, { status: 'Success' });
  } catch (error) {
    console.error(`Seat reservation job ${job.id} failed: ${error.message}`);
    done(error);
  }
});

const app = express();
const port = 1245;

app.use(express.json());

// Route to get the number of available seats
app.get('/available_seats', async (req, res) => {
  try {
    const numberOfAvailableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to reserve a seat
app.get('/reserve_seat', (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservations are blocked' });
  }
  const job = queue.create('reserve_seat', { number: 1 }).save(err => {
    if (err) {
      return res.json({ status: 'Reservation failed' });
    }
    res.json({ status: 'Reservation in process' });
  });
});

// Route to process the queue
app.get('/process', (req, res) => {
  res.json({ status: 'Queue processing' });
  queue.process('reserve_seat', 2); // Ensure this line to process jobs
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = { reserveSeat, getCurrentAvailableSeats };
