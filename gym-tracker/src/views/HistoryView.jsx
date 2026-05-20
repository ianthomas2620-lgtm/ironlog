import { useState } from 'react';
import { formatDate, CAT_COLOR, totalVolume, oneRM } from '../data.js';

export default function HistoryView({ data, updateData }) {
  const [expanded, setExpanded] = useState(null);

  const sorted = [...data.sessions]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  function deleteSession(date) {
    if (!confirm('Delete this session?')) return;
    updateData({ sessions: data.sessions.filter(s => s.date !== date) });
    if (expanded === date) setExpanded(null);
  }

  if (!sorted.length) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)', padding: 32 }}>
        <span style={{ fontSize: 48 }}>📋</span>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dim)' }}>No sessions yet</div>
        <div style={{ fontSize: 13, textAlign: 'center' }}>Log your first workout in the Log tab</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '12px 16px 16px' }}>
      {sorted.map(session => {
        const isOpen = expanded === session.date;
        const cats = [...new Set(
          session.exercises.map(e => data.exercises.find(ex => ex.id === e.exerciseId)?.category).filter(Boolean)
        )];
        const vol = session.exercises.reduce((a, e) => a + totalVolume(e.sets), 0);

        return (
          <div
            key={session.date}
            className="fade-in"
            style={{
              marginBottom: 10,
              borderRadius: 12,
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : session.date)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
              }}
            >
              {/* Category dots */}
              <div style={{ display: 'flex', gap: 4 }}>
                {cats.map(c => (
                  <div key={c} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: CAT_COLOR[c],
                    boxShadow: `0 0 5px ${CAT_COLOR[c]}`,
                  }} />
                ))}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {formatDate(session.date)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''} · {vol.toFixed(0)}kg total vol
                </div>
              </div>

              <span style={{ color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div style={{ padding: '0 16px 16px' }}>
                {session.exercises.map(se => {
                  const ex = data.exercises.find(e => e.id === se.exerciseId);
                  if (!ex) return null;
                  const color = CAT_COLOR[ex.category];
                  const best = se.sets.filter(s=>s.reps>0&&s.weight>0)
                    .reduce((b, s) => oneRM(s.weight,s.reps) > oneRM(b.weight,b.reps) ? s : b, se.sets[0] || {weight:0,reps:0});

                  return (
                    <div key={se.exerciseId} style={{
                      marginBottom: 12,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'var(--surface2)',
                      borderLeft: `3px solid ${color}`,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{ex.name}</div>
                      {se.sets.map((s, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          gap: 8,
                          fontSize: 12,
                          color: 'var(--text-dim)',
                          marginBottom: 2,
                        }}>
                          <span style={{ color: 'var(--text-muted)', width: 14 }}>{i+1}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{s.weight}kg</span>
                          <span>×</span>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{s.reps} reps</span>
                          <span style={{ marginLeft: 'auto', color }}>e1RM {oneRM(s.weight,s.reps)}kg</span>
                        </div>
                      ))}
                      {best.weight > 0 && (
                        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                          Vol: {totalVolume(se.sets).toFixed(0)}kg
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => deleteSession(session.date)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)',
                    color: 'var(--danger)',
                    fontSize: 12,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  Delete Session
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
