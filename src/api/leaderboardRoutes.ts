import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { revealAnswerIfAllowed } from '../challenge';

const router = Router();

router.get('/leaderboard', (_req, res) => {
  const scoresDir = path.join(__dirname, '..', '..', 'data', 'scores');
  const leaderboard: { player: string; score: number }[] = [];

  if (fs.existsSync(scoresDir)) {
    for (const file of fs.readdirSync(scoresDir)) {
      const player = path.basename(file, '.json');
      try {
        const raw = fs.readFileSync(path.join(scoresDir, file), 'utf-8');
        const data = JSON.parse(raw);
        const score = typeof data.score === 'number' ? data.score : 0;
        leaderboard.push({ player, score });
      } catch {
        leaderboard.push({ player, score: 0 });
      }
    }
  }

  leaderboard.sort((a, b) => b.score - a.score);
  res.json({ leaderboard });
});

router.get('/reveal', (req, res) => {
  const user = String(req.query.user || '');
  if (!user) {
    return res.status(400).json({ error: 'User required' });
  }

  const answer = revealAnswerIfAllowed(user);
  if (answer) {
    return res.json({ answer });
  }
  return res.status(403).json({ error: 'Guesses remaining' });
});

export default router;
