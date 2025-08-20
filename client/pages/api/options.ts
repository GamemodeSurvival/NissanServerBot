import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'cars.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf8')) as Array<{
      manufacturer: string;
      model: string;
      year: number;
    }>;

    const manufacturers = Array.from(new Set(data.map(c => c.manufacturer))).sort();
    const models = Array.from(new Set(data.map(c => c.model))).sort();
    const years = Array.from(new Set(data.map(c => c.year))).sort((a, b) => a - b);

    res.status(200).json({ manufacturers, models, years });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load options' });
  }
}
