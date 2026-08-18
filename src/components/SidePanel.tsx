import { AddPlayerForm } from './AddPlayerForm';
import { MonsterSidebar } from './MonsterSidebar';
import type { PlayerFormValues } from '../data/combatantFactory';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  onAddPlayer: (player: PlayerFormValues) => void;
}

export function SidePanel({ open, onClose, onAddPlayer }: SidePanelProps) {
  return (
    <>
      {open && <div className="side-panel-backdrop" onClick={onClose} />}
      <aside className={`side-panel ${open ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h2 className="column-title">Add combatant</h2>
          <button type="button" className="side-panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <h3 className="side-panel-subtitle">Add player</h3>
        <AddPlayerForm onAdd={onAddPlayer} />

        <h3 className="side-panel-subtitle">Monster sidebar</h3>
        <MonsterSidebar />
      </aside>
    </>
  );
}
