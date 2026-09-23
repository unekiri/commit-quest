import type { ComponentPropsWithoutRef } from "react";

export type RpgButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary";
};

/** RPG command-menu style button. */
export function RpgButton({ variant = "primary", className = "", ...rest }: RpgButtonProps) {
  const variantClass =
    variant === "primary"
      ? "border-rpg-gold bg-rpg-gold/10 text-rpg-gold hover:bg-rpg-gold/20"
      : "border-rpg-border bg-rpg-bg text-rpg-text hover:bg-rpg-panel";

  return (
    <button
      type="button"
      className={`motion-safe:transition-transform cursor-pointer border-2 px-4 py-2 text-sm font-bold tracking-wide disabled:cursor-not-allowed disabled:opacity-50 motion-safe:hover:-translate-y-0.5 ${variantClass} ${className}`}
      {...rest}
    />
  );
}
