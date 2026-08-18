import { useDroppable } from '@dnd-kit/core';
import { EntityStatCard } from './EntityStatCard';
import type { Combatant } from '../types/combatant';

interface EntitiesColumnProps {
  combatants: Combatant[];
  visible: boolean;
}

export function EntitiesColumn({ combatants, visible }: EntitiesColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'entities-column' });

  return (
    <section
      ref={setNodeRef}
      className={`column entities-column ${visible ? 'visible' : ''} ${isOver ? 'drop-target' : ''}`}
    >
      <h2 className="column-title">Entities</h2>
      {combatants.map((combatant) => (
        <EntityStatCard key={combatant.id} combatant={combatant} />
      ))}
      {combatants.length === 0 && <p className="empty-hint">Drag a monster here from the sidebar</p>}
    </section>
  );
}
