import { useState, useEffect } from 'react';
import { loadData, saveData, todayStr } from './data.js';
import LogView from './views/LogView.jsx';
import HistoryView from './views/HistoryView.jsx';
import ProgressView from './views/ProgressView.jsx';

const TABS = [
  { id: 'log',      label: 'Log',      icon: '💪' },
  { id: 'history',  label: 'History',  icon: '📋' },
  { id: 'progress', label: 'Progress', icon: '📈' },
];

export default function App() {
  const [tab, setTab] = useState('log');
  const [data, setData] = useState(() => loadData());

  useEffect(() => { saveData(data); }, [data]);

  function updateData(patch) {
    setData(d => ({ ...d, ...patch }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        flexShrink: 0,
        background: 'var(--bg)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 2, color: 'var(--accent)' }}>IRON</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 2, color: 'var(--text)' }}>LOG</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'log' && (
          <LogView data={data} updateData={updateData} />
        )}
        {tab === 'history' && (
          <HistoryView data={data} updateData={updateData} />
        )}
        {tab === 'progress' && (
          <ProgressView data={data} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        display: 'flex',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '12px 0 10px',
              background: 'none',
              color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s',
              borderTop: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
