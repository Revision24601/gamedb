'use client';

import { useMemo } from 'react';
import { FaLightbulb } from 'react-icons/fa';

interface GameFactsProps {
  title: string;
  hoursPlayed: number;
  rating: number;
  status: string;
  platform: string;
  notes?: string;
  createdAt?: string;
}

const comparisons = [
  { threshold: 500, text: (h: number) => `That's like watching all of Lord of the Rings extended editions ${Math.floor(h / 11.4)} times.` },
  { threshold: 200, text: (h: number) => `That's roughly ${Math.floor(h / 2)} feature-length movies worth of gaming.` },
  { threshold: 100, text: (h: number) => `You could have driven from New York to LA ${(h / 40).toFixed(1)} times in that time.` },
  { threshold: 50, text: (h: number) => `That's about ${Math.floor(h / 8)} full work days of gaming.` },
  { threshold: 10, text: (h: number) => `That's like binge-watching a ${Math.ceil(h / 0.75)}-episode anime season.` },
  { threshold: 0, text: (h: number) => `Every hour counts — you've invested ${h} so far.` },
];

export default function GameFacts({ title, hoursPlayed, rating, status, platform, notes, createdAt }: GameFactsProps) {
  const facts = useMemo(() => {
    const list: string[] = [];

    // Release date from notes
    const releaseMatch = notes?.match(/Release Date:\s*(.+)/i);
    if (releaseMatch && releaseMatch[1] !== 'Unknown') {
      const releaseDate = new Date(releaseMatch[1]);
      if (!isNaN(releaseDate.getTime())) {
        const years = Math.floor((Date.now() - releaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (years > 0) {
          list.push(`Released ${years} year${years > 1 ? 's' : ''} ago — ${years > 20 ? 'a true classic!' : years > 10 ? 'a certified veteran.' : years > 5 ? 'still holding up.' : 'pretty recent!'}`);
        }
      }
    }

    // Hours comparison
    if (hoursPlayed > 0) {
      const comp = comparisons.find(c => hoursPlayed >= c.threshold);
      if (comp) list.push(comp.text(hoursPlayed));
    }

    // Rating fact
    if (rating >= 9) list.push(`You rated this ${rating}/10 — that's elite status. Only the best earn this score.`);
    else if (rating >= 7) list.push(`A solid ${rating}/10 — this one clearly made an impression on you.`);
    else if (rating > 0 && rating <= 4) list.push(`${rating}/10 — hey, not every game can be a winner. At least you tried it.`);

    // Status fact
    if (status === 'Completed') list.push(`Achievement unlocked: you actually finished this one. Only ~30% of gamers complete the games they start.`);
    if (status === 'Dropped') list.push(`Sometimes knowing when to walk away is the real power move.`);
    if (status === 'Playing' && hoursPlayed > 100) list.push(`${hoursPlayed}+ hours and still going? This might be your forever game.`);

    // Added date
    if (createdAt) {
      const added = new Date(createdAt);
      const daysAgo = Math.floor((Date.now() - added.getTime()) / (24 * 60 * 60 * 1000));
      if (daysAgo === 0) list.push(`Added today — fresh addition to the collection!`);
      else if (daysAgo < 7) list.push(`Added ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago.`);
    }

    // Genre fact from notes
    const genreMatch = notes?.match(/Genres?:\s*(.+)/i);
    if (genreMatch) {
      const genres = genreMatch[1].split(',').map(g => g.trim()).filter(g => g && g !== 'Unknown');
      if (genres.length >= 3) list.push(`This game blends ${genres.slice(0, 3).join(', ')} — that's a lot of flavor in one package.`);
    }

    return list;
  }, [title, hoursPlayed, rating, status, notes, createdAt]);

  if (facts.length === 0) return null;

  // Pick a random-ish fact (deterministic per title so it doesn't change on re-render)
  const factIndex = title.length % facts.length;
  const displayFacts = [facts[factIndex], ...facts.filter((_, i) => i !== factIndex)].slice(0, 2);

  return (
    <div className="journal-card">
      <h2 className="journal-section">
        <FaLightbulb className="text-accent" />
        Fun Facts
      </h2>
      <div className="space-y-3">
        {displayFacts.map((fact, i) => (
          <p key={i} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {fact}
          </p>
        ))}
      </div>
    </div>
  );
}
