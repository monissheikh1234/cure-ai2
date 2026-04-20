export function FeatureCard({ title, description, actionLabel, onClick }) {
  return (
    <div className="card-glass p-5 flex flex-col gap-3">
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm text-slate-300 flex-1">{description}</div>
      {actionLabel && (
        <button
          onClick={onClick}
          className="btn-primary mt-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

