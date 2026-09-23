import { RpgButton } from "./RpgButton";
import { RpgPanel } from "./RpgPanel";

export type ErrorPanelProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

/** RPG-style error state, per design §21. Never renders the raw upstream error text. */
export function ErrorPanel({ message, onRetry, className = "" }: ErrorPanelProps) {
  return (
    <RpgPanel className={`text-center ${className}`}>
      <p className="text-lg font-bold text-rpg-hp">QUEST FAILED</p>
      <p className="mt-2 text-sm text-rpg-text-muted">{message}</p>
      {onRetry ? (
        <RpgButton className="mt-4" onClick={onRetry}>
          Retry
        </RpgButton>
      ) : null}
    </RpgPanel>
  );
}
