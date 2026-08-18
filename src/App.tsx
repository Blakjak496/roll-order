import { useMemo, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ActivePanelColumn } from './components/ActivePanelColumn';
import type { PanelKind } from './components/ActivePanelColumn';
import { ConditionsPalette } from './components/ConditionsPalette';
import { EntitiesColumn } from './components/EntitiesColumn';
import { HPStatusRow } from './components/HPStatusRow';
import { InitiativePanel } from './components/InitiativePanel';
import { AddPlayerIcon, MonsterIcon } from './components/icons';
import { fetchMonster } from './api/srdClient';
import { monsterToCombatant, playerToCombatant } from './data/combatantFactory';
import type { PlayerFormValues } from './data/combatantFactory';
import { usePersistedEncounter } from './hooks/usePersistedEncounter';
import type { Combatant } from './types/combatant';
import type { MonsterDetail } from './types/monster';
import './App.css';

type Tab = 'panel' | 'entities' | 'hp' | 'initiative';

// closestCenter always resolves `over` to the nearest droppable regardless of actual
// overlap, so picking an item up and barely moving it can otherwise "land" on a target
// with no real drop - callers use this to require the dragged rect to genuinely overlap.
function rectsOverlap(a: { left: number; right: number; top: number; bottom: number }, b: typeof a) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('panel');
  const [activePanel, setActivePanel] = useState<PanelKind>('monster');
  const [draggedMonsterName, setDraggedMonsterName] = useState<string | null>(null);
  const [draggedMonsterDetail, setDraggedMonsterDetail] = useState<MonsterDetail | null>(null);
  const [draggedCombatant, setDraggedCombatant] = useState<Combatant | null>(null);
  const [draggedConditionName, setDraggedConditionName] = useState<string | null>(null);
  const { combatants, setCombatants, activeId, setActiveId, newEncounter } = usePersistedEncounter();

  // Requires real movement before a press counts as a drag, so a plain click
  // (or a drag that's released back near its start) never fires a drop.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const sortedCombatants = useMemo(
    () => [...combatants].sort((a, b) => (b.initiative ?? -1) - (a.initiative ?? -1)),
    [combatants],
  );

  function addMonsterByIndex(index: string) {
    fetchMonster(index).then((monster) => {
      setCombatants((prev) => [...prev, monsterToCombatant(monster)]);
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === 'monster') {
      setDraggedMonsterName(data.name ?? null);
      setDraggedMonsterDetail(null);
      // Prefetch full detail so the drag overlay can show a real card (AC, abilities)
      // instead of just a name - usually resolves well before the drag ends.
      fetchMonster(data.index).then(setDraggedMonsterDetail);
      return;
    }
    if (data?.type === 'condition') {
      setDraggedConditionName(data.name ?? null);
      return;
    }
    setDraggedCombatant(combatants.find((c) => c.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const prefetchedDetail = draggedMonsterDetail;
    setDraggedMonsterName(null);
    setDraggedMonsterDetail(null);
    setDraggedCombatant(null);
    setDraggedConditionName(null);
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current;
    const activeRect = active.rect.current.translated;
    const overlaps = activeRect && rectsOverlap(activeRect, over.rect);

    if (data?.type === 'monster') {
      // dropped from the sidebar - valid whether it lands on the column itself or on a card within it
      const isEntitiesTarget = over.id === 'entities-column' || combatants.some((c) => c.id === over.id);
      if (!isEntitiesTarget || !overlaps) return;

      if (prefetchedDetail && prefetchedDetail.index === data.index) {
        setCombatants((prev) => [...prev, monsterToCombatant(prefetchedDetail)]);
      } else {
        addMonsterByIndex(data.index);
      }
      return;
    }

    if (data?.type === 'condition') {
      const overId = String(over.id);
      if (!overId.startsWith('hp-row-') || !overlaps) return;
      const combatantId = overId.slice('hp-row-'.length);
      const combatant = combatants.find((c) => c.id === combatantId);
      if (combatant && !combatant.statuses.includes(data.key)) {
        handleAddStatus(combatantId, data.key);
      }
      return;
    }

    if (active.id === over.id) return;
    setCombatants((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleAdjustHP(id: string, delta: number) {
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, currentHP: Math.max(0, Math.min(c.maxHP, c.currentHP + delta)) } : c)),
    );
  }

  function handleAddStatus(id: string, status: string) {
    setCombatants((prev) => prev.map((c) => (c.id === id ? { ...c, statuses: [...c.statuses, status] } : c)));
  }

  function handleRemoveStatus(id: string, status: string) {
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, statuses: c.statuses.filter((s) => s !== status) } : c)),
    );
  }

  function handleAddPlayer(player: PlayerFormValues) {
    setCombatants((prev) => [...prev, playerToCombatant(player)]);
  }

  function handleRemoveCombatant(id: string) {
    setCombatants((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }

  function handleSetInitiative(id: string, value: number | null) {
    setCombatants((prev) => prev.map((c) => (c.id === id ? { ...c, initiative: value } : c)));
  }

  function handleNextTurn() {
    if (sortedCombatants.length === 0) return;
    const currentIndex = sortedCombatants.findIndex((c) => c.id === activeId);
    const nextIndex = (currentIndex + 1) % sortedCombatants.length;
    setActiveId(sortedCombatants[nextIndex].id);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setDraggedMonsterName(null);
        setDraggedMonsterDetail(null);
        setDraggedCombatant(null);
        setDraggedConditionName(null);
      }}
      autoScroll={false}
      collisionDetection={closestCenter}
    >
      <div className="app-root">
        <aside className="icon-strip">
          <button
            type="button"
            className={`icon-toggle ${activePanel === 'monster' ? 'active' : ''}`}
            onClick={() => setActivePanel('monster')}
            aria-pressed={activePanel === 'monster'}
            aria-label="Monster compendium"
            title="Monster compendium"
          >
            <MonsterIcon />
          </button>
          <button
            type="button"
            className={`icon-toggle ${activePanel === 'player' ? 'active' : ''}`}
            onClick={() => setActivePanel('player')}
            aria-pressed={activePanel === 'player'}
            aria-label="Add player"
            title="Add player"
          >
            <AddPlayerIcon />
          </button>
        </aside>

        <div className="app-shell">
          <header className="app-header">
            <h1>Roll Order</h1>
            <button
              type="button"
              className="new-encounter-button"
              onClick={() => {
                if (combatants.length === 0 || confirm('Start a new encounter? This clears the current one.')) {
                  newEncounter();
                }
              }}
            >
              New encounter
            </button>
          </header>

          <nav className="tab-switcher">
            <button
              className={`tab-button ${activeTab === 'panel' ? 'active' : ''}`}
              onClick={() => setActiveTab('panel')}
            >
              {activePanel === 'monster' ? 'Compendium' : 'Add player'}
            </button>
            <button
              className={`tab-button ${activeTab === 'entities' ? 'active' : ''}`}
              onClick={() => setActiveTab('entities')}
            >
              Entities
            </button>
            <button className={`tab-button ${activeTab === 'hp' ? 'active' : ''}`} onClick={() => setActiveTab('hp')}>
              HP + Status
            </button>
            <button
              className={`tab-button ${activeTab === 'initiative' ? 'active' : ''}`}
              onClick={() => setActiveTab('initiative')}
            >
              Initiative
            </button>
          </nav>

          <main className="board">
            <ActivePanelColumn
              activePanel={activePanel}
              visible={activeTab === 'panel'}
              onAddPlayer={handleAddPlayer}
              onAddMonster={addMonsterByIndex}
            />

            <EntitiesColumn
              combatants={combatants}
              visible={activeTab === 'entities'}
              onRemove={handleRemoveCombatant}
            />

            <section className={`column hp-column ${activeTab === 'hp' ? 'visible' : ''}`}>
              <h2 className="column-title">HP + Status</h2>
              <div className="hp-rows">
                {combatants.map((combatant) => (
                  <HPStatusRow
                    key={combatant.id}
                    combatant={combatant}
                    onAdjustHP={handleAdjustHP}
                    onAddStatus={handleAddStatus}
                    onRemoveStatus={handleRemoveStatus}
                  />
                ))}
              </div>
              <ConditionsPalette />
            </section>

            <section className={`column initiative-column ${activeTab === 'initiative' ? 'visible' : ''}`}>
              <h2 className="column-title">Initiative</h2>
              <InitiativePanel
                sortedCombatants={sortedCombatants}
                activeId={activeId}
                onSetInitiative={handleSetInitiative}
                onNextTurn={handleNextTurn}
              />
            </section>
          </main>
        </div>
      </div>

      <DragOverlay>
        {draggedMonsterName && (
          <div className="entity-card drag-overlay-card">
            <div className="entity-card-header">
              <div className="entity-card-title">
                <MonsterIcon />
                <span className="entity-name">{draggedMonsterName}</span>
              </div>
              {draggedMonsterDetail && (
                <span className="entity-ac">AC {draggedMonsterDetail.armor_class[0]?.value ?? 10}</span>
              )}
            </div>
            {draggedMonsterDetail && draggedMonsterDetail.actions.length > 0 && (
              <ul className="entity-abilities">
                {draggedMonsterDetail.actions.map((action) => (
                  <li key={action.name}>
                    <span className="ability-name">{action.name}.</span> {action.desc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {draggedCombatant && (
          <div className="entity-card drag-overlay-card">
            <div className="entity-card-header">
              <span className="entity-name">{draggedCombatant.name}</span>
              <span className="entity-ac">AC {draggedCombatant.ac}</span>
            </div>
            {draggedCombatant.abilities && draggedCombatant.abilities.length > 0 && (
              <ul className="entity-abilities">
                {draggedCombatant.abilities.map((ability) => (
                  <li key={ability.name}>
                    <span className="ability-name">{ability.name}.</span> {ability.desc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {draggedConditionName && <div className="condition-chip drag-overlay-chip">{draggedConditionName}</div>}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
