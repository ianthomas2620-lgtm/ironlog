import { useState } from 'react';
import { EXERCISE_LIBRARY, oneRM, totalVolume, getProgressionTarget, hexToRgb } from '../data.js';

export default function ProgressView({ data }) {
  const [selectedId, setSelectedId] = useState(EXERCISE_LIBRARY[0].id);
  const [metric, setMetric] = useState('e1rm');

  const ex = EXERCISE_LIBRARY.find(e => e.id === selectedId);
  const dayWithEx = data.split.find(d => d.exerciseIds.includes(selectedId));
  const color = dayWithEx?.color || '#ff6b35';
  const rgb = hexToRgb(color);

  // All sessions with this exercise
  const relevant = data.sessions
    .filter(s => s.exercises?.some(e => e.exerciseId === selectedId))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const history = relevant.map(s => {
    const e = s.exercises.find(e => e.exerciseId === selectedId);
    const sets = e?.sets.filter(s => s.reps > 0 && s.weight > 0) || [];
    const best = sets.reduce((b, s) => oneRM(s.weight,s.reps) > oneRM(b.weight,b.reps) ? s : b, sets[0] || {weight:0,reps:0});
    return {
      date: s.date,
      e1rm: oneRM(best.weight, best.reps),
      volume: totalVolume(sets),
      topWeight: best.weight,
    };
  });

  const target = getProgressionTarget(data.sessions, selectedId);

  // Chart
  const W = 320, H = 120;
  const pad = { t: 10, r: 12, b: 22, l: 42 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  const metricKey = metric;
  const vals = history.map(h => h[metricKey]);
  const maxV = Math.max(...vals, 1);
  const minV = Math.min(...vals, 0);
  const range = maxV - minV || 1;

  function xP(i) { return pad.l + (i / Math.max(history.length - 1, 1)) * chartW; }
  function yP(v) { return pad.t + chartH - ((v - minV) / range) * chartH; }

  const linePoints = history.map((h, i) => `${xP(i)},${yP(h[metricKey])}`).join(' ');
  const areaPoints = history.length
    ? `${xP(0)},${pad.t + chartH} ${linePoints} ${xP(history.length-1)},${pad.t + chartH}`
    : '';

  // All PRs
  function getPR(exId) {
    let best = null;
    for (const s of data.sessions) {
      const e = s.exercises?.find(e => e.exerciseId === exId);
      if (!e) continue;
      for (const set of e.sets) {
        const e1 = oneRM(set.weight, set.reps);
        if (!best || e1 > best.e1rm) best = { ...set, e1rm: e1, date: s.date };
      }
    }
    return best;
  }

  const categories = [...new Set(EXERCISE_LIBRARY.map(e => e.category))];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16 }}>

      {/* Exercise picker */}
      <div style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>SELECT EXERCISE</div>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          {categories.map(cat => (
            <optgroup key={cat} label={cat}>
              {EXERCISE_LIBRARY.filter(e => e.category === cat).map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Next target */}
      {target && (
        <div style={{
          background: target.type === 'weight'
            ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))'
            : `linear-gradient(135deg, rgba(${rgb},0.12), rgba(${rgb},0.04))`,
          border: `1.5px solid ${target.type === 'weight' ? 'rgba(34,197,94,0.3)' : `rgba(${rgb},0.3)`}`,
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 30 }}>{target.type === 'weight' ? '🏋️' : '🔥'}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: target.type === 'weight' ? '#22c55e' : color, letterSpacing: 0.5 }}>NEXT TARGET</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: '#f5f5f5', letterSpacing: 1, marginTop: 2 }}>
              {target.weight}kg × {target.reps} reps
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              Last: {target.lastWeight}kg × {target.lastReps} · {target.note}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
        {/* Metric toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['e1rm','Est. 1RM'],['volume','Volume'],['topWeight','Top Weight']].map(([k,l]) => (
            <button key={k} onClick={() => setMetric(k)} style={{
              flex: 1, padding: '7px 4px', borderRadius: 7,
              background: metric === k ? color : '#222',
              color: metric === k ? '#fff' : '#555',
              fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
            }}>{l}</button>
          ))}
        </div>

        {history.length >= 2 ? (
          <>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
              <defs>
                <linearGradient id="pgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 0.5, 1].map(f => {
                const v = minV + f * range;
                const y = yP(v);
                return (
                  <g key={f}>
                    <line x1={pad.l} y1={y} x2={W-pad.r} y2={y} stroke="#1e1e1e" strokeWidth="1" />
                    <text x={pad.l-4} y={y+4} fontSize="9" fill="#444" textAnchor="end">{Math.round(v)}</text>
                  </g>
                );
              })}
              <polygon points={areaPoints} fill="url(#pgrad)" />
              <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
              {history.map((h, i) => (
                <circle key={i} cx={xP(i)} cy={yP(h[metricKey])} r="3.5" fill={color} stroke="#0f0f0f" strokeWidth="1.5" />
              ))}
              {history.map((h, i) => {
                if (history.length > 5 && i % 2 !== 0 && i !== history.length - 1) return null;
                const d = new Date(h.date + 'T12:00:00');
                return (
                  <text key={i} x={xP(i)} y={H - 4} fontSize="8" fill="#444" textAnchor="middle">
                    {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </text>
                );
              })}
            </svg>
            {vals.length >= 2 && (
              <div style={{ textAlign: 'center', fontSize: 12, marginTop: 8, color: '#555' }}>
                {vals[vals.length-1] > vals[0]
                  ? <span style={{ color: '#22c55e' }}>↑ +{(vals[vals.length-1]-vals[0]).toFixed(1)} since first session</span>
                  : vals[vals.length-1] < vals[0]
                  ? <span style={{ color: '#ef4444' }}>↓ {(vals[vals.length-1]-vals[0]).toFixed(1)} since first session</span>
                  : <span>No change yet</span>
                }
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#444', padding: '20px 0', fontSize: 13 }}>
            {history.length === 0
              ? 'No sessions logged for this exercise yet'
              : 'Log one more session to see your trend'}
          </div>
        )}
      </div>

      {/* PRs */}
      <div style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 14, padding: '14px' }}>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>🏆 PERSONAL RECORDS</div>
        {data.split.map(day => {
          const exs = day.exerciseIds.map(id => EXERCISE_LIBRARY.find(e => e.id === id)).filter(Boolean);
          const prs = exs.map(e => ({ ex: e, pr: getPR(e.id) })).filter(x => x.pr);
          if (!prs.length) return null;
          const rgb2 = hexToRgb(day.color);
          return (
            <div key={day.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: day.color, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: day.color, boxShadow: `0 0 6px ${day.color}` }} />
                {day.name}
              </div>
              {prs.map(({ ex, pr }) => (
                <div key={ex.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 9,
                  background: `rgba(${rgb2},0.06)`,
                  border: `1px solid rgba(${rgb2},0.12)`,
                  marginBottom: 5,
                  gap: 8,
                }}>
                  <div style={{ flex: 1, fontSize: 12, color: '#d0d0d0', fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: day.color }}>{pr.weight}kg × {pr.reps}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>e1RM {pr.e1rm}kg</div>
                </div>
              ))}
            </div>
          );
        })}
        {!data.split.some(d => d.exerciseIds.some(id => getPR(id))) && (
          <div style={{ textAlign: 'center', color: '#444', fontSize: 13, padding: '10px 0' }}>
            Log your first session to set PRs
          </div>
        )}
      </div>
    </div>
  );
}
