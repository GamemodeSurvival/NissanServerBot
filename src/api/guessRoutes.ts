import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Placeholder for current challenge retrieval.
// In a real application, this would likely be imported from another module
// that tracks the active challenge.
function getCurrentChallenge() {
  return {
    manufacturer: 'Nissan',
    model: 'GT-R',
    year: 2023,
  };
}

interface GuessPayload {
  manufacturer: string;
  model: string;
  year: number;
  guessNumber: number;
  userId: string;
}

const router = Router();

router.post('/guess', (req: Request<{}, {}, GuessPayload>, res: Response) => {
  const { manufacturer, model, year, guessNumber, userId } = req.body;

  // Ensure only the submitting user receives feedback.
  const authUserId = (req as any).user?.id;
  if (authUserId && authUserId !== userId) {
    return res.status(403).json({ message: 'Forbidden: cannot view other users\' attempts.' });
  }

  const challenge = getCurrentChallenge();

  let correct = 0;
  if (manufacturer === challenge.manufacturer) correct += 1;
  if (model === challenge.model) correct += 1;
  if (year === challenge.year) correct += 1;

  const multiplier = Math.max(0, 5 - (guessNumber - 1));
  const points = correct * multiplier;

  const scoresDir = path.resolve(__dirname, '../../data/scores');
  const userScoreFile = path.join(scoresDir, `${userId}.json`);

  fs.mkdirSync(scoresDir, { recursive: true });

  let totalScore = 0;
  if (fs.existsSync(userScoreFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(userScoreFile, 'utf8'));
      if (typeof existing.score === 'number') {
        totalScore = existing.score;
      }
    } catch {
      // ignore parse errors and start from zero
    }
  }

  totalScore += points;
  fs.writeFileSync(userScoreFile, JSON.stringify({ score: totalScore }, null, 2));

  return res.json({ correct, points, totalScore });
});

export default router;
