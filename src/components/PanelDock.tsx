import type { RefObject } from 'react';
import { AddPlayerForm } from './AddPlayerForm';
import { MonsterSidebar } from './MonsterSidebar';
import type { PlayerFormValues } from '../data/combatantFactory';

export type PanelKind = 'monster' | 'player' | null;

interface PanelDockProps {
  activePanel: PanelKind;
  onClose: () => void;
  onAddPlayer: (player: PlayerFormValues) => void;
  onAddMonster: (index: string) => void;
  panelRef: RefObject<HTMLElement | null>;
}

export function PanelDock({ activePanel, onClose, onAddPlayer, onAddMonster, panelRef }: PanelDockProps) {
  return (
    <>
      {activePanel && <div className="panel-backdrop" onClick={onClose} />}
      <aside ref={panelRef} className={`panel-dock ${activePanel ? 'open' : ''}`}>
        {activePanel && (
          <div className="panel-dock-inner">
            <div className="panel-dock-header">
              <h2 className="column-title">{activePanel === 'monster' ? 'Monster compendium' : 'Add player'}</h2>
              <button type="button" className="panel-dock-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
            {activePanel === 'monster' ? (
              <MonsterSidebar onAdd={onAddMonster} />
            ) : (
              <AddPlayerForm onAdd={onAddPlayer} />
            )}
          </div>
        )}
      </aside>
    </>
  );
}
