import type { NextApiRequest, NextApiResponse } from 'next';

const CORRECT = { manufacturer: 'Nissan', model: 'Skyline', year: 1999 };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { manufacturer, model, year } = req.body || {};
  const correct =
    manufacturer === CORRECT.manufacturer &&
    model === CORRECT.model &&
    Number(year) === CORRECT.year;

  res.status(200).json({ correct });
}
