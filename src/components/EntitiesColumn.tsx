import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EntityStatCard } from './EntityStatCard';
import type { Combatant } from '../types/combatant';

interface EntitiesColumnProps {
  combatants: Combatant[];
  visible: boolean;
  onRemove: (id: string) => void;
}

export function EntitiesColumn({ combatants, visible, onRemove }: EntitiesColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'entities-column' });

  return (
    <section
      ref={setNodeRef}
      className={`column entities-column ${visible ? 'visible' : ''} ${isOver ? 'drop-target' : ''}`}
    >
      <SortableContext items={combatants.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {combatants.map((combatant) => (
          <EntityStatCard key={combatant.id} combatant={combatant} onRemove={onRemove} />
        ))}
      </SortableContext>
      {combatants.length === 0 && <p className="empty-hint">Drag a monster here from the sidebar</p>}
    </section>
  );
}
