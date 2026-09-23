export type XpBarProps = {
  /** Current XP within the level, 0-100. */
  xpInLevel: number;
  /** XP required for a level, defaults to 100 per design §6.2. */
  xpToNextLevel?: number;
  /** Progress ratio 0-1, used for the fill width. */
  progress: number;
  className?: string;
};

/** RPG-style experience bar. */
export function XpBar({ xpInLevel, xpToNextLevel = 100, progress, className = "" }: XpBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <div className={className}>
      <div className="h-4 w-full border-2 border-rpg-border bg-rpg-bg">
        <div
          className="h-full bg-rpg-xp motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-rpg-text-muted">
        {xpInLevel} / {xpToNextLevel} XP
      </div>
    </div>
  );
}
