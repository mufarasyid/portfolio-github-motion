export default function Panel({ index, title, blurb, children, className = "" }) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-2xl border border-[#30363d]/60 bg-[#161b22] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] ${className}`}
    >
      <div className="flex items-baseline gap-4 border-b border-[#30363d]/50 px-5 py-4">
        <span className="font-mono text-xs text-[#3fb950]">{index}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-[#e6edf3]">{title}</h2>
          <p className="mt-0.5 text-xs leading-snug text-[#8b949e]">{blurb}</p>
        </div>
      </div>
      <div className="relative flex-1">{children}</div>
    </section>
  );
}
