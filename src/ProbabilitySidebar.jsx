// src/ProbabilitySidebar.jsx
import React from 'react';

export default function ProbabilitySidebar({ probabilities }) {
  const labels = [
    'Top-Left', 'Top-Mid', 'Top-Right',
    'Mid-Left', 'Center',  'Mid-Right',
    'Bot-Left', 'Bot-Mid',   'Bot-Right'
  ];

  return (
    <div className="w-48 bg-gray-800 p-4 text-sm rounded-lg ml-4">
      <h2 className="text-lg mb-2">Move Probabilities</h2>
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
