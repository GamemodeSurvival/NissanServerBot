import React, { useEffect, useState } from 'react';

interface Entry { player: string; score: number; }

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [reveal, setReveal] = useState<string | null>(null);

  useEffect(() => {
    fetch('/leaderboard')
      .then(r => r.json())
      .then(data => setEntries(data.leaderboard || []));

    const user = localStorage.getItem('user');
    if (user) {
      fetch(`/reveal?user=${encodeURIComponent(user)}`)
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(data => setReveal(data.answer))
        .catch(() => {});
    }
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>
      <ol>
        {entries.map(e => (
          <li key={e.player}>{e.player}: {e.score}</li>
        ))}
      </ol>
      {reveal && (
        <div className="reveal">
          <h2>Yesterday's answer</h2>
          <p>{reveal}</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
