import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const cacheDir = path.join(root, 'cache');
const dataDir = path.join(root, 'data');

export function archiveCurrentChallenge(): string | null {
  const current = path.join(cacheDir, 'currentChallenge.json');
  if (!fs.existsSync(current)) return null;

  const historyDir = path.join(dataDir, 'history');
  fs.mkdirSync(historyDir, { recursive: true });
  const dateStr = new Date().toISOString().split('T')[0];
  const dest = path.join(historyDir, `${dateStr}.json`);
  fs.renameSync(current, dest);
  return dest;
}

export function revealAnswerIfAllowed(user: string): string | null {
  const guessesDir = path.join(cacheDir, 'guesses');
  const record = path.join(guessesDir, `${user}.json`);
  if (!fs.existsSync(record)) return null;

  try {
    const { guesses = 0, maxGuesses = 0 } = JSON.parse(fs.readFileSync(record, 'utf-8'));
    if (guesses >= maxGuesses) {
      const historyDir = path.join(dataDir, 'history');
      if (!fs.existsSync(historyDir)) return null;
      const files = fs.readdirSync(historyDir).sort();
      if (!files.length) return null;
      const latest = files[files.length - 1];
      const hist = JSON.parse(fs.readFileSync(path.join(historyDir, latest), 'utf-8'));
      return hist.answer;
    }
  } catch {
    return null;
  }
  return null;
}
