import { useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { EntitiesColumn } from './components/EntitiesColumn';
import { HPStatusRow } from './components/HPStatusRow';
import { InitiativePanel } from './components/InitiativePanel';
import { PanelDock } from './components/PanelDock';
import type { PanelKind } from './components/PanelDock';
import { AddPlayerIcon, MonsterIcon } from './components/icons';
import { fetchMonster } from './api/srdClient';
import { monsterToCombatant, playerToCombatant } from './data/combatantFactory';
import type { PlayerFormValues } from './data/combatantFactory';
import { usePersistedEncounter } from './hooks/usePersistedEncounter';
import type { Combatant } from './types/combatant';
import type { MonsterDetail } from './types/monster';
import './App.css';

type Tab = 'entities' | 'hp' | 'initiative';

const TABS: { id: Tab; label: string }[] = [
  { id: 'entities', label: 'Entities' },
  { id: 'hp', label: 'HP + Status' },
  { id: 'initiative', label: 'Initiative' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('entities');
  const [activePanel, setActivePanel] = useState<PanelKind>(null);
  const [draggedMonsterName, setDraggedMonsterName] = useState<string | null>(null);
  const [draggedMonsterDetail, setDraggedMonsterDetail] = useState<MonsterDetail | null>(null);
  const [draggedCombatant, setDraggedCombatant] = useState<Combatant | null>(null);
  const { combatants, setCombatants, activeId, setActiveId, newEncounter } = usePersistedEncounter();

  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // Requires real movement before a press counts as a drag, so a plain click
  // (or a drag that's released back near its start) never fires a drop.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const sortedCombatants = useMemo(
    () => [...combatants].sort((a, b) => (b.initiative ?? -1) - (a.initiative ?? -1)),
    [combatants],
  );

  // Clicking outside the panel or header closes it. Listens for "click" rather
  // than "pointerdown" - a drag that starts inside the panel and is released
  // outside it never fires a click at all, so this can't misfire mid-drag.
  useEffect(() => {
    if (!activePanel) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (headerRef.current?.contains(target)) return;
      setActivePanel(null);
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [activePanel]);

  function togglePanel(panel: PanelKind) {
    setActivePanel((current) => (current === panel ? null : panel));
  }

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
    setDraggedCombatant(combatants.find((c) => c.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const prefetchedDetail = draggedMonsterDetail;
    setDraggedMonsterName(null);
    setDraggedMonsterDetail(null);
    setDraggedCombatant(null);
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current;

    if (data?.type === 'monster') {
      // dropped from the sidebar - valid whether it lands on the column itself or on a card within it
      const isEntitiesTarget = over.id === 'entities-column' || combatants.some((c) => c.id === over.id);
      if (!isEntitiesTarget) return;

      if (prefetchedDetail && prefetchedDetail.index === data.index) {
        setCombatants((prev) => [...prev, monsterToCombatant(prefetchedDetail)]);
      } else {
        addMonsterByIndex(data.index);
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
      }}
      autoScroll={false}
      collisionDetection={closestCenter}
    >
      <div className="app-root">
        <PanelDock
          activePanel={activePanel}
          onClose={() => setActivePanel(null)}
          onAddPlayer={handleAddPlayer}
          onAddMonster={addMonsterByIndex}
          panelRef={panelRef}
        />

        <div className="app-shell">
          <header className="app-header" ref={headerRef}>
            <div className="app-header-icons">
              <button
                type="button"
                className={`icon-toggle ${activePanel === 'monster' ? 'active' : ''}`}
                onClick={() => togglePanel('monster')}
                aria-pressed={activePanel === 'monster'}
                aria-label="Monster compendium"
                title="Monster compendium"
              >
                <MonsterIcon />
              </button>
              <button
                type="button"
                className={`icon-toggle ${activePanel === 'player' ? 'active' : ''}`}
                onClick={() => togglePanel('player')}
                aria-pressed={activePanel === 'player'}
                aria-label="Add player"
                title="Add player"
              >
                <AddPlayerIcon />
              </button>
            </div>
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
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <main className="board">
            <EntitiesColumn
              combatants={combatants}
              visible={activeTab === 'entities'}
              onRemove={handleRemoveCombatant}
            />

            <section className={`column hp-column ${activeTab === 'hp' ? 'visible' : ''}`}>
              <h2 className="column-title">HP + Status</h2>
              {combatants.map((combatant) => (
                <HPStatusRow
                  key={combatant.id}
                  combatant={combatant}
                  onAdjustHP={handleAdjustHP}
                  onAddStatus={handleAddStatus}
                  onRemoveStatus={handleRemoveStatus}
                />
              ))}
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
      </DragOverlay>
    </DndContext>
  );
}

export default App;
