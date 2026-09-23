import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type RpgPanelProps = ComponentPropsWithoutRef<"div"> & {
  title?: ReactNode;
};

/** Command-window style bordered panel, the base building block of the RPG UI. */
export function RpgPanel({ title, className = "", children, ...rest }: RpgPanelProps) {
  return (
    <div
      className={`border-2 border-rpg-border bg-rpg-panel text-rpg-text shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] ${className}`}
      {...rest}
    >
      {title !== undefined ? (
        <div className="border-b-2 border-rpg-border bg-rpg-bg/60 px-3 py-2 text-sm font-bold tracking-wide text-rpg-gold">
          {title}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </div>
  );
}
