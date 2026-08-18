import { useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { EntitiesColumn } from './components/EntitiesColumn';
import { HPStatusRow } from './components/HPStatusRow';
import { InitiativePanel } from './components/InitiativePanel';
import { SidePanel } from './components/SidePanel';
import { fetchMonster } from './api/srdClient';
import { monsterToCombatant, playerToCombatant } from './data/combatantFactory';
import type { PlayerFormValues } from './data/combatantFactory';
import { usePersistedEncounter } from './hooks/usePersistedEncounter';
import './App.css';

type Tab = 'entities' | 'hp' | 'initiative';

const TABS: { id: Tab; label: string }[] = [
  { id: 'entities', label: 'Entities' },
  { id: 'hp', label: 'HP + Status' },
  { id: 'initiative', label: 'Initiative' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('entities');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { combatants, setCombatants, activeId, setActiveId, newEncounter } = usePersistedEncounter();

  const sortedCombatants = useMemo(
    () => [...combatants].sort((a, b) => (b.initiative ?? -1) - (a.initiative ?? -1)),
    [combatants],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over?.id !== 'entities-column') return;
    const data = active.data.current;
    if (data?.type !== 'monster') return;

    fetchMonster(data.index).then((monster) => {
      setCombatants((prev) => [...prev, monsterToCombatant(monster)]);
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
    <DndContext onDragEnd={handleDragEnd}>
      <div className="app-shell">
        <header className="app-header">
          <h1>Roll Order</h1>
          <div className="app-header-actions">
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
            <button type="button" className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
              + Add combatant
            </button>
          </div>
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

        <SidePanel open={sidebarOpen} onClose={() => setSidebarOpen(false)} onAddPlayer={handleAddPlayer} />
      </div>
    </DndContext>
  );
}

export default App;
