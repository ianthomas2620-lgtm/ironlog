import { useState } from 'react';
import { todayStr, DEFAULT_EXERCISES, CAT_COLOR, getTarget, getLastSession, oneRM } from '../data.js';

const CATEGORIES = ['Push', 'Pull', 'Legs'];

export default function LogView({ data, updateData }) {
  const today = todayStr();
  const [selectedCat, setSelectedCat] = useState('Push');
  const [activeExId, setActiveExId] = useState(null);

  // Get or create today's session
  const session = data.sessions.find(s => s.date === today) || { date: today, exercises: [] };

  function saveSession(updatedSession) {
    const sessions = data.sessions.filter(s => s.date !== today);
    updateData({ sessions: [...sessions, updatedSession] });
  }

  function getSessionEx(exId) {
    return session.exercises.find(e => e.exerciseId === exId) || { exerciseId: exId, sets: [] };
  }

  function updateExercise(exId, updated) {
    const exercises = session.exercises.filter(e => e.exerciseId !== exId);
    saveSession({ ...session, exercises: updated.sets.length ? [...exercises, updated] : exercises });
  }

  function addSet(exId) {
    const sx = getSessionEx(exId);
    const target = getTarget(data.sessions.filter(s => s.date !== today), exId);
    const last = sx.sets[sx.sets.length - 1];
    const newSet = last
      ? { weight: last.weight, reps: last.reps }
      : { weight: target?.weight || 0, reps: target?.reps || 8 };
    updateExercise(exId, { ...sx, sets: [...sx.sets, newSet] });
  }

  function updateSet(exId, i, field, val) {
    const sx = getSessionEx(exId);
    const sets = sx.sets.map((s, idx) =>
      idx === i ? { ...s, [field]: parseFloat(val) || 0 } : s
    );
    updateExercise(exId, { ...sx, sets });
  }

  function removeSet(exId, i) {
    const sx = getSessionEx(exId);
    const sets = sx.sets.filter((_, idx) => idx !== i);
    updateExercise(exId, { ...sx, sets });
  }

  const exercises = data.exercises.filter(e => e.category === selectedCat);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Category Tabs */}
      <div style={{ display: 'flex', padding: '10px 16px 0', gap: 8, flexShrink: 0 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCat(cat); setActiveExId(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              background: selectedCat === cat ? CAT_COLOR[cat] : 'var(--surface2)',
              color: selectedCat === cat ? '#fff' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.3,
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>
        {exercises.map(ex => {
          const sx = getSessionEx(ex.id);
          const target = getTarget(data.sessions.filter(s => s.date !== today), ex.id);
          const isActive = activeExId === ex.id;
          const hasSets = sx.sets.length > 0;
          const color = CAT_COLOR[ex.category];

          return (
            <div
              key={ex.id}
              className="fade-in"
              style={{
                marginBottom: 10,
                borderRadius: 12,
                border: `1.5px solid ${isActive ? color : hasSets ? 'rgba(255,255,255,0.08)' : 'var(--border)'}`,
                background: isActive ? `rgba(${hexToRgb(color)}, 0.06)` : 'var(--surface)',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Exercise Header */}
              <button
                onClick={() => setActiveExId(isActive ? null : ex.id)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: hasSets ? color : 'var(--border)',
                  flexShrink: 0,
                  boxShadow: hasSets ? `0 0 6px ${color}` : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{ex.name}</div>
                  {hasSets && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {sx.sets.length} set{sx.sets.length !== 1 ? 's' : ''} · {sx.sets.reduce((a,s)=>a+s.weight*s.reps,0).toFixed(0)}kg vol
                    </div>
                  )}
                  {!hasSets && target && (
                    <div style={{ fontSize: 11, color: color, marginTop: 2, opacity: 0.8 }}>
                      Target: {target.weight}kg × {target.reps} — {target.note}
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{isActive ? '−' : '+'}</span>
              </button>

              {/* Expanded */}
              {isActive && (
                <div style={{ padding: '0 14px 14px' }}>
                  {/* Target Banner */}
                  {target && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: `rgba(${hexToRgb(color)}, 0.1)`,
                      border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <span style={{ fontSize: 16 }}>{target.type === 'weight' ? '🎯' : '💥'}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color }}>PROGRESSIVE OVERLOAD TARGET</div>
                        <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 1 }}>
                          {target.weight}kg × {target.reps} reps — {target.note}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sets Header */}
                  {sx.sets.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr 16px 1fr 28px',
                      gap: 6,
                      marginBottom: 6,
                      padding: '0 4px',
                    }}>
                      <span />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', letterSpacing: 0.5 }}>WEIGHT</span>
                      <span />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', letterSpacing: 0.5 }}>REPS</span>
                      <span />
                    </div>
                  )}

                  {/* Sets */}
                  {sx.sets.map((set, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '24px 1fr 16px 1fr 28px',
                        gap: 6,
                        marginBottom: 8,
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{i + 1}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min="0"
                        value={set.weight || ''}
                        onChange={e => updateSet(ex.id, i, 'weight', e.target.value)}
                        placeholder="0"
                        style={{ width: '100%', padding: '9px 6px' }}
                      />
                      <span style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>×</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={set.reps || ''}
                        onChange={e => updateSet(ex.id, i, 'reps', e.target.value)}
                        placeholder="0"
                        style={{ width: '100%', padding: '9px 6px' }}
                      />
                      <button
                        onClick={() => removeSet(ex.id, i)}
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          color: 'var(--danger)',
                          borderRadius: 6,
                          padding: '6px',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >✕</button>
                    </div>
                  ))}

                  {/* Add Set Button */}
                  <button
                    onClick={() => addSet(ex.id)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 8,
                      background: `rgba(${hexToRgb(color)}, 0.1)`,
                      color: color,
                      fontSize: 13,
                      fontWeight: 600,
                      marginTop: 4,
                      border: `1.5px dashed rgba(${hexToRgb(color)}, 0.3)`,
                    }}
                  >
                    + Add Set
                  </button>

                  {/* 1RM preview */}
                  {sx.sets.length > 0 && sx.sets.some(s => s.reps > 0 && s.weight > 0) && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                      Est. 1RM: <span style={{ color, fontWeight: 700 }}>
                        {Math.max(...sx.sets.filter(s=>s.reps>0&&s.weight>0).map(s => oneRM(s.weight, s.reps)))}kg
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '255,255,255';
}
