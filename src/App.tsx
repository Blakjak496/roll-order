import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { EntitiesColumn } from './components/EntitiesColumn';
import { HPStatusRow } from './components/HPStatusRow';
import { InitiativePanel } from './components/InitiativePanel';
import { MonsterSidebar } from './components/MonsterSidebar';
import { fetchMonster } from './api/srdClient';
import { monsterToCombatant } from './data/combatantFactory';
import { mockCombatants } from './data/mockCombatants';
import './App.css';

type Tab = 'entities' | 'hp' | 'initiative';

const TABS: { id: Tab; label: string }[] = [
  { id: 'entities', label: 'Entities' },
  { id: 'hp', label: 'HP + Status' },
  { id: 'initiative', label: 'Initiative' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('entities');
  const [combatants, setCombatants] = useState(mockCombatants);
  const activeId = combatants[0]?.id ?? null;

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

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="app-shell">
        <header className="app-header">
          <h1>Roll Order</h1>
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
          <EntitiesColumn combatants={combatants} visible={activeTab === 'entities'} />

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
            <InitiativePanel combatants={combatants} activeId={activeId} />
          </section>
        </main>

        <section className="monster-sidebar-panel">
          <h2 className="column-title">Monster sidebar</h2>
          <MonsterSidebar />
        </section>
      </div>
    </DndContext>
  );
}

export default App;
