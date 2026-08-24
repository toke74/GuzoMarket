type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-brand-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-4xl font-bold tracking-normal text-text-primary sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-lg leading-8 text-text-secondary">{description}</p>
      ) : null}
    </header>
  );
}
