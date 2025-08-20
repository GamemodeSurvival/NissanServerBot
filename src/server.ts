import express from 'express';
import cors from 'cors';
import leaderboardRoutes from './api/leaderboardRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', leaderboardRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
