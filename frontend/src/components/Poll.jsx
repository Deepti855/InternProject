import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Poll({ pollData, onVote }) {
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [options, setOptions] = useState(pollData.options);

  const handleVote = (optionId) => {
    if (votedOptionId) return; // Prevent double voting
    setVotedOptionId(optionId);
    
    // Optimistic UI update
    const newOptions = options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });
    setOptions(newOptions);
    onVote(optionId);
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="mt-4 space-y-3">
      <h4 className="font-bold text-vibin-text text-sm mb-2">{pollData.question || 'Live Poll'}</h4>
      {options.map((opt) => {
        const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
        const isVoted = votedOptionId === opt.id;

        return (
          <div 
            key={opt.id} 
            onClick={() => handleVote(opt.id)}
            className={`relative overflow-hidden rounded-xl border p-3 cursor-pointer transition-all duration-300 ${
              votedOptionId 
                ? isVoted ? 'border-vibin-primary bg-vibin-primary/10' : 'border-vibin-border/30 bg-vibin-card/50'
                : 'border-vibin-border hover:border-vibin-primary hover:bg-vibin-primary/5'
            }`}
          >
            {/* Animated Progress Bar */}
            {votedOptionId && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-0 top-0 bottom-0 bg-vibin-primary opacity-20"
              />
            )}
            
            <div className="relative z-10 flex justify-between items-center">
              <span className={`font-semibold text-sm ${isVoted ? 'text-vibin-primary' : 'text-vibin-text'}`}>
                 {opt.text}
              </span>
              {votedOptionId && (
                <span className="text-xs font-bold text-vibin-muted">
                  {percentage}%
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div className="text-xs text-vibin-muted mt-2 text-right">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
      </div>
    </div>
  );
}
