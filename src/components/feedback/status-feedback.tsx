type StatusFeedbackProps = {
  message?: string;
};

export function StatusFeedback({ message }: StatusFeedbackProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-md border border-success/20 bg-success/5 px-4 py-3 text-sm text-success" role="status" aria-live="polite">
      {message}
    </p>
  );
}
