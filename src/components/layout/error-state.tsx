import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Unable to load", message }: ErrorStateProps) {
  return (
    <div
      className="flex max-w-xl items-start gap-4 rounded-md border border-error/30 bg-surface p-5"
      role="alert"
    >
      <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{message}</p>
      </div>
    </div>
  );
}
