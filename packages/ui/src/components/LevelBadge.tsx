export type LevelBadgeProps = {
  level: number;
  className?: string;
};

/** Small "Lv. N" badge used across player/repository cards. */
export function LevelBadge({ level, className = "" }: LevelBadgeProps) {
  return (
    <span
      className={`inline-block border-2 border-rpg-gold bg-rpg-gold/10 px-2 py-0.5 text-xs font-bold text-rpg-gold ${className}`}
    >
      Lv. {level}
    </span>
  );
}
