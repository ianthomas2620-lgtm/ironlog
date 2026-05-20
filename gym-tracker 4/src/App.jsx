import { useState, useEffect } from 'react';
import { loadData, saveData } from './data.js';
import HomeView from './views/HomeView.jsx';
import LogView from './views/LogView.jsx';
import ProgressView from './views/ProgressView.jsx';
import PlanView from './views/PlanView.jsx';
import WeightView from './views/WeightView.jsx';

const TABS = [
  { id: 'home',     icon: '⚡', label: 'Home' },
  { id: 'log',      icon: '💪', label: 'Log' },
  { id: 'weight',   icon: '⚖️',  label: 'Weight' },
  { id: 'progress', icon: '📈', label: 'Progress' },
  { id: 'plan',     icon: '🗂️',  label: 'Plan' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [data, setData] = useState(() => loadData());
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => { saveData(data); }, [data]);

  function updateData(patch) {
    setData(d => ({ ...d, ...patch }));
  }

  function startDay(day) {
    setActiveDay(day);
    setTab('log');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <header style={{
        padding: '14px 20px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: '1px solid #222',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            letterSpacing: 3,
            background: 'linear-gradient(135deg, #ff6b35, #ff9f1c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>IRON</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            letterSpacing: 3,
            color: '#f5f5f5',
          }}>LOG</span>
        </div>
        <div style={{
          fontSize: 12,
          color: '#666',
          fontWeight: 500,
          textAlign: 'right',
        }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'home'     && <HomeView     data={data} onStartDay={startDay} />}
        {tab === 'log'      && <LogView      data={data} updateData={updateData} activeDay={activeDay} setActiveDay={setActiveDay} />}
        {tab === 'weight'   && <WeightView   data={data} updateData={updateData} />}
        {tab === 'progress' && <ProgressView data={data} />}
        {tab === 'plan'     && <PlanView     data={data} updateData={updateData} />}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        display: 'flex',
        background: '#111',
        borderTop: '1px solid #222',
        flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '10px 0 8px',
                background: 'none',
                color: active ? '#ff6b35' : '#555',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                borderTop: active ? '2px solid #ff6b35' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 19 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
