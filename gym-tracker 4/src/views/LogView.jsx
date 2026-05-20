import { useState } from 'react';
import { todayStr, EXERCISE_LIBRARY, getProgressionTarget, oneRM, totalVolume, hexToRgb } from '../data.js';

export default function LogView({ data, updateData, activeDay, setActiveDay }) {
  const [expandedEx, setExpandedEx] = useState(null);
  const today = todayStr();

  const session = data.sessions.find(s => s.date === today && s.dayId === activeDay?.id)
    || { date: today, dayId: activeDay?.id, exercises: [] };

  function saveSession(updated) {
    const others = data.sessions.filter(s => !(s.date === today && s.dayId === activeDay?.id));
    updateData({ sessions: [...others, updated] });
  }

  function getSessionEx(exId) {
    return session.exercises.find(e => e.exerciseId === exId) || { exerciseId: exId, sets: [] };
  }

  function updateExercise(exId, updated) {
    const others = session.exercises.filter(e => e.exerciseId !== exId);
    const exercises = updated.sets.length ? [...others, updated] : others;
    saveSession({ ...session, exercises });
  }

  function addSet(exId) {
    const sx = getSessionEx(exId);
    const pastSessions = data.sessions.filter(s => !(s.date === today && s.dayId === activeDay?.id));
    const target = getProgressionTarget(pastSessions, exId);
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
    updateExercise(exId, { ...sx, sets: sx.sets.filter((_, idx) => idx !== i) });
  }

  // Pick a day if none active
  if (!activeDay) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', padding: 16 }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 16, fontWeight: 600 }}>SELECT DAY TO LOG</div>
        {data.split.map((day, i) => {
          const rgb = hexToRgb(day.color);
          return (
            <button
              key={day.id}
              onClick={() => setActiveDay(day)}
              style={{
                width: '100%',
                background: `linear-gradient(135deg, rgba(${rgb},0.14), rgba(${rgb},0.05))`,
                border: `1.5px solid rgba(${rgb},0.25)`,
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 8,
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `rgba(${rgb},0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 16, color: day.color,
              }}>D{i+1}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: day.color }}>{day.name}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{day.exerciseIds.length} exercises</div>
              </div>
              <span style={{ marginLeft: 'auto', color: day.color }}>→</span>
            </button>
          );
        })}
      </div>
    );
  }

  const dayColor = activeDay.color;
  const rgb = hexToRgb(dayColor);
  const exercises = activeDay.exerciseIds
    .map(id => EXERCISE_LIBRARY.find(e => e.id === id))
    .filter(Boolean);

  const pastSessions = data.sessions.filter(s => !(s.date === today && s.dayId === activeDay.id));
  const sessionVol = session.exercises.reduce((a, e) => a + totalVolume(e.sets), 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Day Header */}
      <div style={{
        padding: '12px 16px 10px',
        background: `linear-gradient(135deg, rgba(${rgb},0.18), rgba(${rgb},0.04))`,
        borderBottom: `1px solid rgba(${rgb},0.2)`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => setActiveDay(null)}
          style={{ background: `rgba(${rgb},0.15)`, color: dayColor, borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700 }}
        >← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: dayColor, letterSpacing: 1 }}>{activeDay.name}</div>
          <div style={{ fontSize: 11, color: '#666' }}>
            {session.exercises.length} done · {sessionVol.toFixed(0)}kg vol
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 16px' }}>
        {exercises.map((ex, idx) => {
          const sx = getSessionEx(ex.id);
          const target = getProgressionTarget(pastSessions, ex.id);
          const isOpen = expandedEx === ex.id;
          const hasSets = sx.sets.length > 0;
          const allSetsLogged = hasSets && sx.sets.every(s => s.reps > 0 && s.weight > 0);

          return (
            <div
              key={ex.id}
              className="fade-up"
              style={{
                marginBottom: 9,
                borderRadius: 13,
                border: `1.5px solid ${isOpen ? dayColor : hasSets ? `rgba(${rgb},0.35)` : '#2a2a2a'}`,
                background: isOpen
                  ? `linear-gradient(135deg, rgba(${rgb},0.1), rgba(${rgb},0.03))`
                  : hasSets ? `rgba(${rgb},0.05)` : '#181818',
                overflow: 'hidden',
                transition: 'border-color 0.2s, background 0.2s',
                animationDelay: `${idx * 0.03}s`,
              }}
            >
              {/* Exercise header */}
              <button
                onClick={() => setExpandedEx(isOpen ? null : ex.id)}
                style={{
                  width: '100%', padding: '13px 14px',
                  background: 'none', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                  background: allSetsLogged ? dayColor : hasSets ? `rgba(${rgb},0.5)` : '#333',
                  boxShadow: allSetsLogged ? `0 0 8px ${dayColor}` : 'none',
                  transition: 'all 0.2s',
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>
                    {hasSets
                      ? `${sx.sets.length} sets · ${totalVolume(sx.sets).toFixed(0)}kg vol`
                      : target
                      ? <span style={{ color: `rgba(${rgb},0.8)` }}>🎯 {target.weight}kg × {target.reps} — {target.note}</span>
                      : 'No history yet — set your first weight'
                    }
                  </div>
                </div>

                <span style={{ color: '#444', fontSize: 16 }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ padding: '0 14px 14px' }}>

                  {/* Progression target banner */}
                  {target && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: target.type === 'weight'
                        ? `linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))`
                        : `linear-gradient(135deg, rgba(${rgb},0.12), rgba(${rgb},0.04))`,
                      border: `1.5px solid ${target.type === 'weight' ? 'rgba(34,197,94,0.25)' : `rgba(${rgb},0.25)`}`,
                      marginBottom: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{target.type === 'weight' ? '🏋️' : '🔥'}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: target.type === 'weight' ? '#22c55e' : dayColor, letterSpacing: 0.5 }}>
                            PROGRESSIVE OVERLOAD TARGET
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0', marginTop: 2 }}>
                            {target.weight}kg × {target.reps} reps
                          </div>
                          <div style={{ fontSize: 11, color: '#666', marginTop: 1 }}>
                            Last: {target.lastWeight}kg × {target.lastReps} reps · {target.note}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Column headers */}
                  {sx.sets.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr 18px 1fr 32px', gap: 6, marginBottom: 5, padding: '0 2px' }}>
                      <span/>
                      <span style={{ fontSize: 10, color: '#555', textAlign: 'center', fontWeight: 700, letterSpacing: 0.5 }}>KG</span>
                      <span/>
                      <span style={{ fontSize: 10, color: '#555', textAlign: 'center', fontWeight: 700, letterSpacing: 0.5 }}>REPS</span>
                      <span/>
                    </div>
                  )}

                  {/* Sets */}
                  {sx.sets.map((set, i) => {
                    const hitTarget = target && set.reps >= target.reps && Math.abs(set.weight - target.weight) < 0.1;
                    return (
                      <div key={i} style={{
                        display: 'grid',
                        gridTemplateColumns: '22px 1fr 18px 1fr 32px',
                        gap: 6,
                        marginBottom: 7,
                        alignItems: 'center',
                      }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: hitTarget ? '#22c55e' : '#444',
                          textAlign: 'center',
                        }}>{i + 1}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          min="0"
                          value={set.weight || ''}
                          onChange={e => updateSet(ex.id, i, 'weight', e.target.value)}
                          placeholder="0"
                          style={{ borderColor: hitTarget ? '#22c55e' : undefined }}
                        />
                        <span style={{ textAlign: 'center', fontSize: 13, color: '#444', fontWeight: 700 }}>×</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={set.reps || ''}
                          onChange={e => updateSet(ex.id, i, 'reps', e.target.value)}
                          placeholder="0"
                          style={{ borderColor: hitTarget ? '#22c55e' : undefined }}
                        />
                        <button
                          onClick={() => removeSet(ex.id, i)}
                          style={{
                            background: 'rgba(239,68,68,0.12)',
                            color: '#ef4444',
                            borderRadius: 7,
                            padding: '7px 0',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >✕</button>
                      </div>
                    );
                  })}

                  {/* Add set */}
                  <button
                    onClick={() => addSet(ex.id)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: 9,
                      background: `rgba(${rgb},0.08)`,
                      color: dayColor,
                      fontSize: 13,
                      fontWeight: 700,
                      border: `1.5px dashed rgba(${rgb},0.3)`,
                      marginTop: 2,
                    }}
                  >+ Add Set</button>

                  {/* e1RM */}
                  {sx.sets.some(s => s.reps > 0 && s.weight > 0) && (
                    <div style={{ marginTop: 9, textAlign: 'center', fontSize: 12, color: '#555' }}>
                      Est. 1RM: <span style={{ color: dayColor, fontWeight: 700, fontSize: 13 }}>
                        {Math.max(...sx.sets.filter(s=>s.reps>0&&s.weight>0).map(s => oneRM(s.weight, s.reps)))}kg
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {exercises.length === 0 && (
          <div style={{ textAlign: 'center', color: '#555', padding: '40px 0', fontSize: 14 }}>
            No exercises in this day yet.<br/>Go to Plan to add some.
          </div>
        )}
      </div>
    </div>
  );
}
