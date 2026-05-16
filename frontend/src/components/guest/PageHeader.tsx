export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-12 flex items-end justify-between border-b border-divider pb-8">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-gold">
          Rosewood Sand Hill
        </p>
        <h1 className="mt-2 font-serif text-4xl font-light tracking-tight text-charcoal md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl font-display text-lg text-charcoal-soft">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
