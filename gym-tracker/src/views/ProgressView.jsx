import { useState } from 'react';
import { CAT_COLOR, getHistory, getTarget, DEFAULT_EXERCISES, oneRM } from '../data.js';

export default function ProgressView({ data }) {
  const [selectedEx, setSelectedEx] = useState(data.exercises[0]?.id || '');
  const [metric, setMetric] = useState('e1rm');

  const ex = data.exercises.find(e => e.id === selectedEx);
  const history = getHistory(data.sessions, selectedEx);
  const target = getTarget(data.sessions, selectedEx);
  const color = ex ? CAT_COLOR[ex.category] : '#ff6b35';

  const metricKey = metric === 'e1rm' ? 'e1rm' : metric === 'volume' ? 'volume' : 'topWeight';
  const metricLabel = metric === 'e1rm' ? 'Est. 1RM (kg)' : metric === 'volume' ? 'Volume (kg)' : 'Top Weight (kg)';

  const values = history.map(h => h[metricKey]);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  // Simple SVG line chart
  const W = 320, H = 100;
  const pad = { t: 10, r: 10, b: 20, l: 40 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  function xPos(i) { return pad.l + (i / Math.max(history.length - 1, 1)) * chartW; }
  function yPos(v) { return pad.t + chartH - ((v - minVal) / range) * chartH; }

  const points = history.map((h, i) => `${xPos(i)},${yPos(h[metricKey])}`).join(' ');
  const areaPoints = history.length
    ? `${xPos(0)},${pad.t + chartH} ${points} ${xPos(history.length-1)},${pad.t + chartH}`
    : '';

  // PRs per exercise
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

  const categories = ['Push', 'Pull', 'Legs'];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '12px 16px 16px' }}>
      {/* Exercise Picker */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1.5px solid var(--border)',
        padding: '12px 14px',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5 }}>SELECT EXERCISE</div>
        <select
          value={selectedEx}
          onChange={e => setSelectedEx(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--surface2)',
            border: '1.5px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
            fontSize: 14,
            padding: '9px 12px',
            fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        >
          {categories.map(cat => (
            <optgroup key={cat} label={cat}>
              {data.exercises.filter(e => e.category === cat).map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1.5px solid var(--border)',
        padding: '14px',
        marginBottom: 12,
      }}>
        {/* Metric toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['e1rm', '1RM'], ['volume', 'Volume'], ['topWeight', 'Weight']].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMetric(k)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 6,
                background: metric === k ? color : 'var(--surface2)',
                color: metric === k ? '#fff' : 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {history.length >= 2 ? (
          <>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y axis labels */}
              {[0, 0.5, 1].map(f => {
                const v = minVal + f * range;
                const y = yPos(v);
                return (
                  <g key={f}>
                    <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <text x={pad.l - 4} y={y + 4} fontSize="9" fill="#555" textAnchor="end">{Math.round(v)}</text>
                  </g>
                );
              })}

              {/* Area */}
              <polygon points={areaPoints} fill="url(#grad)" />

              {/* Line */}
              <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

              {/* Dots */}
              {history.map((h, i) => (
                <circle key={i} cx={xPos(i)} cy={yPos(h[metricKey])} r="3.5" fill={color} stroke="var(--bg)" strokeWidth="1.5" />
              ))}

              {/* X labels */}
              {history.map((h, i) => {
                if (history.length > 5 && i % 2 !== 0) return null;
                const d = new Date(h.date + 'T00:00:00');
                return (
                  <text key={i} x={xPos(i)} y={H - 4} fontSize="8" fill="#555" textAnchor="middle">
                    {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </text>
                );
              })}
            </svg>

            {/* Trend */}
            {values.length >= 2 && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                {values[values.length-1] > values[0]
                  ? <span style={{ color: 'var(--success)' }}>↑ +{(values[values.length-1] - values[0]).toFixed(1)} {metricLabel.split(' ')[0]} since start</span>
                  : values[values.length-1] < values[0]
                  ? <span style={{ color: 'var(--danger)' }}>↓ {(values[values.length-1] - values[0]).toFixed(1)} since start</span>
                  : <span>No change yet</span>
                }
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: 13 }}>
            Log {2 - history.length} more session{history.length === 0 ? 's' : ''} to see your trend
          </div>
        )}
      </div>

      {/* Next Target */}
      {target && (
        <div style={{
          background: `rgba(${hexToRgb(color)}, 0.08)`,
          border: `1.5px solid rgba(${hexToRgb(color)}, 0.25)`,
          borderRadius: 12,
          padding: '14px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>{target.type === 'weight' ? '🎯' : '🔥'}</span>
          <div>
            <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 0.5 }}>NEXT TARGET</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
              {target.weight}kg × {target.reps} reps
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{target.note}</div>
          </div>
        </div>
      )}

      {/* Personal Records */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1.5px solid var(--border)',
        padding: '14px',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 0.5 }}>🏆 PERSONAL RECORDS</div>
        {categories.map(cat => {
          const exs = data.exercises.filter(e => e.category === cat);
          const catColor = CAT_COLOR[cat];
          return (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: catColor, marginBottom: 8 }}>{cat}</div>
              {exs.map(e => {
                const pr = getPR(e.id);
                if (!pr) return null;
                return (
                  <div key={e.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '7px 10px',
                    borderRadius: 8,
                    background: 'var(--surface2)',
                    marginBottom: 4,
                    gap: 8,
                  }}>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>{e.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: catColor }}>{pr.weight}kg × {pr.reps}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>e1RM {pr.e1rm}kg</div>
                  </div>
                );
              })}
              {!exs.some(e => getPR(e.id)) && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0' }}>No data yet</div>
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

function getPR(sessions, exId) {
  let best = null;
  for (const s of sessions) {
    const e = s.exercises?.find(e => e.exerciseId === exId);
    if (!e) continue;
    for (const set of e.sets) {
      const e1 = oneRM(set.weight, set.reps);
      if (!best || e1 > best.e1rm) best = { ...set, e1rm: e1 };
    }
  }
  return best;
}
