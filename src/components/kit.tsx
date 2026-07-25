import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_24px_-8px_var(--color-primary)]",
    outline: "border border-border bg-surface-2/60 text-foreground hover:border-primary/60",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-2/60",
    danger: "border border-destructive/50 text-destructive hover:bg-destructive/10",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        className,
      )}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border border-input bg-background/70 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none",
        className,
      )}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-md border border-input bg-background/70 px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none",
        className,
      )}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-md border border-input bg-background/70 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none",
        className,
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-mono">{label}</span>
      {children}
    </label>
  );
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "accent";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const tones: Record<Tone, string> = {
    neutral: "border-border bg-surface-2 text-muted-foreground",
    primary: "border-primary/40 bg-primary/10 text-primary",
    success: "border-success/40 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/10 text-warning",
    danger: "border-destructive/40 bg-destructive/10 text-destructive",
    accent: "border-accent/40 bg-accent/10 text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="panel px-4 py-3">
      <div className="label-mono">{label}</div>
      <div className="mt-1 font-mono text-lg text-foreground">{value}</div>
    </div>
  );
}
