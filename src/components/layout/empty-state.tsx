import { CircleOff } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex max-w-xl items-start gap-4 rounded-md border border-border bg-surface p-5">
      <CircleOff className="mt-1 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
