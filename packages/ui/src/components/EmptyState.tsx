export type EmptyStateProps = {
  message?: string;
  className?: string;
};

/** RPG-style empty state, per design §21. */
export function EmptyState({ message = "NO QUESTS FOUND", className = "" }: EmptyStateProps) {
  return (
    <div className={`border-2 border-dashed border-rpg-border p-6 text-center text-rpg-text-muted ${className}`}>
      {message}
    </div>
  );
}
