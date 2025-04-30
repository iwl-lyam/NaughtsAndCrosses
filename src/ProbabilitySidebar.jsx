import React from 'react';

const labels = [
  'Top-Left', 'Top-Mid', 'Top-Right',
  'Mid-Left','Center','Mid-Right',
  'Bot-Left','Bot-Mid','Bot-Right'
];

export default function ProbabilitySidebar({ probabilities }) {
  return (
    <div className="w-full bg-gray-800 p-4 text-sm rounded-lg">
      <h2 className="text-lg mb-2">Last MENACE Probabilities</h2>
      <ul className="space-y-1">
        {probabilities.map((p, i) => (
          <li key={i} className="flex justify-between">
            <span>{labels[i]}</span>
            <span>{Math.round(p * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
