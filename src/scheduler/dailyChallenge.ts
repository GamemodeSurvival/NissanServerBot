import cron from 'node-cron';
import { promises as fs } from 'fs';
import path from 'path';

interface Car {
  manufacturer: string;
  model: string;
  year: number;
  imagePath: string;
}

interface CurrentChallenge {
  timestamp: string;
  car: Car;
}

const ROOT_DIR = path.resolve(__dirname, '../../');
const DATA_PATH = path.join(ROOT_DIR, 'data', 'cars.json');
const CACHE_PATH = path.join(ROOT_DIR, 'cache', 'currentChallenge.json');

async function readCars(): Promise<Car[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data) as Car[];
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function updateChallenge(): Promise<CurrentChallenge> {
  const car = pickRandom(await readCars());
  const challenge: CurrentChallenge = {
    timestamp: new Date().toISOString(),
    car,
  };
  await fs.writeFile(CACHE_PATH, JSON.stringify(challenge, null, 2));
  return challenge;
}

export async function getCurrentChallenge(): Promise<CurrentChallenge> {
  const data = await fs.readFile(CACHE_PATH, 'utf-8');
  return JSON.parse(data) as CurrentChallenge;
}

async function ensureChallenge() {
  try {
    const current = await getCurrentChallenge();
    if (new Date(current.timestamp).toDateString() === new Date().toDateString()) {
      return;
    }
  } catch {
    // ignore, will create new challenge
  }
  await updateChallenge();
}

cron.schedule(
  '0 8 * * *',
  () => {
    updateChallenge().catch(err => console.error('Failed to update challenge', err));
  },
  {
    timezone: 'America/New_York',
  }
);

ensureChallenge().catch(err => console.error('Failed to initialize challenge', err));
