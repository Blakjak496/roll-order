import { useEffect, useRef, useState } from 'react';

interface StatusChipProps {
  name: string;
  effect: string;
  onRemove: () => void;
}

export function StatusChip({ name, effect, onRemove }: StatusChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [open]);

  return (
    <span className="status-chip" ref={ref}>
      <button
        type="button"
        className="status-chip-label"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {name}
      </button>
      <button type="button" className="status-chip-remove" onClick={onRemove} aria-label={`Remove ${name}`}>
        ×
      </button>
      {open && (
        <div className="status-chip-tooltip" role="tooltip">
          {effect}
        </div>
      )}
    </span>
  );
}
