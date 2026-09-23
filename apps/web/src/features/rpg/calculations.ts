/**
 * Pure RPG calculation helpers, per design.md §6.2 / §8 / §9.
 * No side effects, no fetching — these only transform numbers already
 * fetched via TanStack Query.
 */

const XP_PER_COMMIT = 10;
const XP_PER_LEVEL = 100;

/** Commit count -> total XP. */
export function xpFromCommitCount(commitCount: number): number {
  return commitCount * XP_PER_COMMIT;
}

/** Total XP -> level, floor(XP / 100) + 1. */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** XP already earned within the current level. */
export function xpInCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

/** Progress toward the next level, 0-1. */
export function progressToNextLevel(xp: number): number {
  return xpInCurrentLevel(xp) / XP_PER_LEVEL;
}

export type LevelInfo = {
  xp: number;
  level: number;
  xpInLevel: number;
  progress: number;
};

/** Convenience: derive the full level breakdown from a commit count. */
export function levelInfoFromCommitCount(commitCount: number): LevelInfo {
  const xp = xpFromCommitCount(commitCount);
  return {
    xp,
    level: levelFromXp(xp),
    xpInLevel: xpInCurrentLevel(xp),
    progress: progressToNextLevel(xp),
  };
}

/** Fixed XP reward shown on the Commit Detail "QUEST CLEAR!" screen. */
export const COMMIT_DETAIL_XP = 10;

/**
 * Quest number for a commit within a repository's commit history.
 * The most recent commit (page 1, index 0) is the highest number,
 * counting down toward #1 as history gets older.
 */
export function questNumber(repoCommitCount: number, page: number, perPage: number, indexInPage: number): number {
  return repoCommitCount - ((page - 1) * perPage + indexInPage);
}
