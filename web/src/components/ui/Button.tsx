import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "text" | "danger";
type Size = "md" | "sm";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color,transform] duration-[180ms] ease-quick active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "rounded-control bg-action text-white hover:bg-action-dark active:bg-action-dark",
  secondary: "rounded-control border border-line bg-paper text-ink hover:border-ink-3",
  text: "rounded-chip text-action underline-offset-4 hover:underline",
  danger: "rounded-control border border-transparent text-danger hover:border-danger",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-5 text-body md:h-11",
  sm: "h-11 px-3.5 text-small md:h-9",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className = "") {
  return [base, variants[variant], variant === "text" ? "min-h-11 px-1 text-body md:min-h-0" : sizes[size], className].join(" ");
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 m-auto size-4 rounded-full border-2 border-current border-r-transparent"
      style={{ animation: "spin 700ms linear infinite" }}
    />
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean };

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
    >
      {loading && <Spinner />}
      <span className={loading ? "invisible inline-flex items-center gap-2" : "inline-flex items-center gap-2"}>{children}</span>
    </button>
  );
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant = "primary", size = "md", className, ...rest }: LinkProps) {
  return <Link {...rest} className={buttonClass(variant, size, className)} />;
}
