import { useState } from 'react';
import { EXERCISE_LIBRARY, hexToRgb } from '../data.js';

export default function PlanView({ data, updateData }) {
  const [selectedDay, setSelectedDay] = useState(data.split[0]?.id || null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [filter, setFilter] = useState('All');

  const day = data.split.find(d => d.id === selectedDay);
  const rgb = day ? hexToRgb(day.color) : '255,107,53';

  function toggleExercise(exId) {
    const updated = data.split.map(d => {
      if (d.id !== selectedDay) return d;
      const has = d.exerciseIds.includes(exId);
      return {
        ...d,
        exerciseIds: has
          ? d.exerciseIds.filter(id => id !== exId)
          : [...d.exerciseIds, exId],
      };
    });
    updateData({ split: updated });
  }

  function moveUp(exId) {
    const updated = data.split.map(d => {
      if (d.id !== selectedDay) return d;
      const ids = [...d.exerciseIds];
      const i = ids.indexOf(exId);
      if (i <= 0) return d;
      [ids[i-1], ids[i]] = [ids[i], ids[i-1]];
      return { ...d, exerciseIds: ids };
    });
    updateData({ split: updated });
  }

  function moveDown(exId) {
    const updated = data.split.map(d => {
      if (d.id !== selectedDay) return d;
      const ids = [...d.exerciseIds];
      const i = ids.indexOf(exId);
      if (i < 0 || i >= ids.length - 1) return d;
      [ids[i], ids[i+1]] = [ids[i+1], ids[i]];
      return { ...d, exerciseIds: ids };
    });
    updateData({ split: updated });
  }

  const categories = ['All', ...new Set(EXERCISE_LIBRARY.map(e => e.category))];
  const libraryFiltered = filter === 'All'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter(e => e.category === filter);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Day Tabs */}
      <div style={{ padding: '10px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10 }}>
          {data.split.map((d, i) => {
            const active = d.id === selectedDay;
            const r = hexToRgb(d.color);
            return (
              <button
                key={d.id}
                onClick={() => { setSelectedDay(d.id); setShowLibrary(false); }}
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  borderRadius: 20,
                  background: active ? `rgba(${r},0.2)` : '#1c1c1c',
                  border: `1.5px solid ${active ? d.color : '#2a2a2a'}`,
                  color: active ? d.color : '#555',
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                D{i+1} {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 16px' }}>
        {day && (
          <>
            {/* Day header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              padding: '2px 0',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: day.color, letterSpacing: 1 }}>{day.name}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{day.exerciseIds.length} exercises</div>
              </div>
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                style={{
                  background: showLibrary ? `rgba(${rgb},0.2)` : '#222',
                  border: `1.5px solid ${showLibrary ? day.color : '#333'}`,
                  color: showLibrary ? day.color : '#888',
                  borderRadius: 9,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >{showLibrary ? '✕ Close' : '+ Add'}</button>
            </div>

            {/* Current exercises */}
            {!showLibrary && (
              <>
                {day.exerciseIds.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#444', padding: '30px 0', fontSize: 13 }}>
                    No exercises yet — tap + Add to build your session
                  </div>
                ) : (
                  day.exerciseIds.map((exId, i) => {
                    const ex = EXERCISE_LIBRARY.find(e => e.id === exId);
                    if (!ex) return null;
                    return (
                      <div key={exId} className="fade-up" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '11px 12px',
                        borderRadius: 11,
                        background: '#181818',
                        border: '1.5px solid #252525',
                        marginBottom: 7,
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <button
                            onClick={() => moveUp(exId)}
                            disabled={i === 0}
                            style={{ background: '#222', color: i === 0 ? '#333' : '#888', borderRadius: 4, padding: '2px 5px', fontSize: 10 }}
                          >▲</button>
                          <button
                            onClick={() => moveDown(exId)}
                            disabled={i === day.exerciseIds.length - 1}
                            style={{ background: '#222', color: i === day.exerciseIds.length - 1 ? '#333' : '#888', borderRadius: 4, padding: '2px 5px', fontSize: 10 }}
                          >▼</button>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{ex.name}</div>
                          <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
                            <span style={{
                              background: ex.type === 'compound' ? 'rgba(255,107,53,0.12)' : 'rgba(0,201,167,0.12)',
                              color: ex.type === 'compound' ? '#ff6b35' : '#00c9a7',
                              borderRadius: 4,
                              padding: '1px 5px',
                              fontWeight: 700,
                              fontSize: 9,
                              letterSpacing: 0.3,
                            }}>{ex.type}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleExercise(exId)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            borderRadius: 7,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >Remove</button>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* Library */}
            {showLibrary && (
              <div className="fade-up">
                {/* Category filter */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      style={{
                        flexShrink: 0,
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: filter === cat ? '#ff6b35' : '#1c1c1c',
                        color: filter === cat ? '#fff' : '#666',
                        fontSize: 11,
                        fontWeight: 700,
                        border: 'none',
                      }}
                    >{cat}</button>
                  ))}
                </div>

                {libraryFiltered.map(ex => {
                  const inDay = day.exerciseIds.includes(ex.id);
                  return (
                    <div key={ex.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: inDay ? `rgba(${rgb},0.08)` : '#181818',
                      border: `1.5px solid ${inDay ? `rgba(${rgb},0.3)` : '#252525'}`,
                      marginBottom: 6,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: inDay ? day.color : '#d0d0d0' }}>{ex.name}</div>
                        <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>
                          {ex.category} ·{' '}
                          <span style={{
                            color: ex.type === 'compound' ? '#ff6b35' : '#00c9a7',
                            fontWeight: 700,
                          }}>{ex.type}</span>
                          {ex.type === 'compound' ? ' · +5kg jump' : ' · +2.5kg jump'}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExercise(ex.id)}
                        style={{
                          background: inDay ? 'rgba(239,68,68,0.12)' : `rgba(${rgb},0.15)`,
                          color: inDay ? '#ef4444' : day.color,
                          borderRadius: 7,
                          padding: '7px 12px',
                          fontSize: 12,
                          fontWeight: 700,
                          border: 'none',
                          minWidth: 64,
                        }}
                      >{inDay ? 'Remove' : '+ Add'}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
