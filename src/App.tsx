import { useState } from 'react';
import { EntityStatCard } from './components/EntityStatCard';
import { HPStatusRow } from './components/HPStatusRow';
import { InitiativePanel } from './components/InitiativePanel';
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
  const combatants = mockCombatants;
  const activeId = combatants[0]?.id ?? null;

  return (
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
        <section className={`column entities-column ${activeTab === 'entities' ? 'visible' : ''}`}>
          <h2 className="column-title">Entities</h2>
          {combatants.map((combatant) => (
            <EntityStatCard key={combatant.id} combatant={combatant} />
          ))}
        </section>

        <section className={`column hp-column ${activeTab === 'hp' ? 'visible' : ''}`}>
          <h2 className="column-title">HP + Status</h2>
          {combatants.map((combatant) => (
            <HPStatusRow key={combatant.id} combatant={combatant} />
          ))}
        </section>

        <section className={`column initiative-column ${activeTab === 'initiative' ? 'visible' : ''}`}>
          <h2 className="column-title">Initiative</h2>
          <InitiativePanel combatants={combatants} activeId={activeId} />
        </section>
      </main>
    </div>
  );
}

export default App;
