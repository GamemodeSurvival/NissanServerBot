import React, { useEffect, useState } from 'react';

interface Options {
  manufacturers: string[];
  models: string[];
  years: number[];
}

interface Guess {
  manufacturer: string;
  model: string;
  year: number;
}

const LOCAL_KEY = 'daily-car-guesses';
const LEVEL_KEY = 'daily-car-level';

const DailyCarGame: React.FC = () => {
  const [level, setLevel] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LEVEL_KEY) : null;
    return saved ? Number(saved) : 1;
  });
  const [options, setOptions] = useState<Options>({ manufacturers: [], models: [], years: [] });
  const [guess, setGuess] = useState<Guess>({ manufacturer: '', model: '', year: new Date().getFullYear() });
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/options')
      .then(res => res.json())
      .then(setOptions)
      .catch(() => setOptions({ manufacturers: [], models: [], years: [] }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedGuesses = localStorage.getItem(LOCAL_KEY);
    if (savedGuesses) {
      setGuesses(JSON.parse(savedGuesses));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(guesses));
  }, [guesses]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LEVEL_KEY, String(level));
  }, [level]);

  const handleChange = (field: keyof Guess) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGuess({ ...guess, [field]: field === 'year' ? Number(e.target.value) : e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guess),
    });
    const data = await res.json();
    setGuesses([...guesses, guess]);
    if (!data.correct) {
      setLevel(level + 1);
      setMessage('Try again!');
    } else {
      setMessage('Correct!');
    }
  };

  return (
    <div>
      <h1>Daily Car Game</h1>
      <img src={`/image/${level}`} alt={`zoom level ${level}`} />
      <form onSubmit={handleSubmit}>
        <select value={guess.manufacturer} onChange={handleChange('manufacturer')} required>
          <option value="" disabled>Select manufacturer</option>
          {options.manufacturers.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={guess.model} onChange={handleChange('model')} required>
          <option value="" disabled>Select model</option>
          {options.models.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={guess.year} onChange={handleChange('year')} required>
          <option value="" disabled>Select year</option>
          {options.years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button type="submit">Guess</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DailyCarGame;
