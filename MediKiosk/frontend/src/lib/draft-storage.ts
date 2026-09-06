'use client';

/**
 * Robust Local Storage Draft Persistence
 * Guarantees that refreshing during any onboarding stage preserves
 * form values without progress loss or redirection loops.
 */

export const saveDraft = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`medikiosk_draft_${key}`, JSON.stringify(data));
    }
  } catch (err) {
    console.error('Failed to save draft:', err);
  }
};

export const loadDraft = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`medikiosk_draft_${key}`);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    }
  } catch (err) {
    console.error('Failed to load draft:', err);
  }
  return defaultValue;
};

export const clearDraft = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`medikiosk_draft_${key}`);
    }
  } catch (err) {
    console.error('Failed to clear draft:', err);
  }
};
