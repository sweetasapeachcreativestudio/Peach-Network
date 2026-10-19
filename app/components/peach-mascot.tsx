export default function PeachMascot({ note, compact = false }: { note?: string; compact?: boolean }) {
  return (
    <div className={`peach-mascot-wrap ${compact ? "compact" : ""}`} aria-label={note ? `Peach mascot says: ${note}` : "Peach mascot"}>
      <div className="peach-mascot" aria-hidden="true">
        <span className="leaf" />
        <span className="eye left" />
        <span className="eye right" />
        <span className="smile" />
        <span className="arm left" />
        <span className="arm right" />
      </div>
      {note && <div className="peach-note">{note}</div>}
    </div>
  );
}
