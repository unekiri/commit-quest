import { RpgPanel } from "./RpgPanel";

export type LoadingPanelProps = {
  className?: string;
};

/** RPG-style loading indicator, per design §21. */
export function LoadingPanel({ className = "" }: LoadingPanelProps) {
  return (
    <RpgPanel className={`animate-pulse text-center ${className}`}>
      <p className="text-rpg-gold">Loading Quest...</p>
    </RpgPanel>
  );
}
