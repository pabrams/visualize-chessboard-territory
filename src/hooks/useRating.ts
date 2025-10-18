import { useState, useEffect } from 'react';

const RATING_STORAGE_KEY = 'monkeyDrill_userRating';
const DEFAULT_RATING = 300;

export const useRating = () => {
  const [rating, setRating] = useState<number>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(RATING_STORAGE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      return isNaN(parsed) ? DEFAULT_RATING : parsed;
    }
    return DEFAULT_RATING;
  });

  // Save to localStorage whenever rating changes
  useEffect(() => {
    localStorage.setItem(RATING_STORAGE_KEY, rating.toString());
  }, [rating]);

  const incrementRating = () => {
    setRating(prev => prev + 1);
  };

  const decrementRating = () => {
    setRating(prev => prev - 1);
  };

  const resetRating = () => {
    setRating(DEFAULT_RATING);
  };

  return {
    rating,
    incrementRating,
    decrementRating,
    resetRating,
  };
};
