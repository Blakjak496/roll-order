import { AddPlayerForm } from './AddPlayerForm';
import { MonsterSidebar } from './MonsterSidebar';
import type { PlayerFormValues } from '../data/combatantFactory';

export type PanelKind = 'monster' | 'player';

interface ActivePanelColumnProps {
  activePanel: PanelKind;
  visible: boolean;
  onAddPlayer: (player: PlayerFormValues) => void;
  onAddMonster: (index: string) => void;
}

// Always one of the two panels - this is a permanent column, not a toggleable drawer.
// The icon strip just picks which content shows here.
export function ActivePanelColumn({ activePanel, visible, onAddPlayer, onAddMonster }: ActivePanelColumnProps) {
  return (
    <section className={`column panel-column ${visible ? 'visible' : ''}`}>
      <h2 className="column-title">{activePanel === 'monster' ? 'Monster compendium' : 'Add player'}</h2>
      {activePanel === 'monster' ? <MonsterSidebar onAdd={onAddMonster} /> : <AddPlayerForm onAdd={onAddPlayer} />}
    </section>
  );
}
