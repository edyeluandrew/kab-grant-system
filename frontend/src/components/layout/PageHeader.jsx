export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary truncate">{title}</h1>
        {subtitle && <p className="mt-2 text-muted text-sm sm:text-base">{subtitle}</p>}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
