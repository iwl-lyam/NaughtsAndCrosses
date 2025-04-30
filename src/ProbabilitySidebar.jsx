import React from 'react';

/**
 * A 3×3 grid showing MENACE's last-move probabilities.
 * Each cell matches the main board's square styling, with green fill at alpha = probability.
 */
export default function ProbabilitySidebar({ probabilities }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {probabilities.map((p, i) => (
        <div
          key={i}
          className="w-20 h-20 flex items-center justify-center border border-white bg-green-500 text-white text-xl"
          style={{ opacity: p }}
        >
          {Math.round(p * 100)}%
        </div>
      ))}
    </div>
  );
}
