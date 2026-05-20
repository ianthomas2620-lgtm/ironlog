import { useState } from 'react';
import { todayStr, formatDate } from '../data.js';

export default function WeightView({ data, updateData }) {
  const [input, setInput] = useState('');
  const [targetInput, setTargetInput] = useState(String(data.bulkTarget || 90));
  const [editTarget, setEditTarget] = useState(false);

  const sorted = [...data.bodyweight].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = sorted[sorted.length - 1];
  const target = data.bulkTarget || 90;

  function logWeight() {
    const w = parseFloat(input);
    if (!w || w < 30 || w > 250) return;
    const today = todayStr();
    const existing = data.bodyweight.filter(b => b.date !== today);
    updateData({ bodyweight: [...existing, { date: today, weight: w }] });
    setInput('');
  }

  function saveTarget() {
    const t = parseFloat(targetInput);
    if (t > 0) updateData({ bulkTarget: t });
    setEditTarget(false);
  }

  function deleteEntry(date) {
    updateData({ bodyweight: data.bodyweight.filter(b => b.date !== date) });
  }

  // Chart
  const W = 320, H = 130;
  const pad = { t: 12, r: 12, b: 24, l: 42 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  const allVals = sorted.map(b => b.weight);
  const minVal = allVals.length ? Math.min(...allVals, target) - 2 : target - 10;
  const maxVal = allVals.length ? Math.max(...allVals, target) + 2 : target + 5;
  const range = maxVal - minVal || 1;

  function xP(i) { return pad.l + (i / Math.max(sorted.length - 1, 1)) * chartW; }
  function yP(v) { return pad.t + chartH - ((v - minVal) / range) * chartH; }

  const linePoints = sorted.map((b, i) => `${xP(i)},${yP(b.weight)}`).join(' ');
  const areaPoints = sorted.length
    ? `${xP(0)},${pad.t + chartH} ${linePoints} ${xP(sorted.length - 1)},${pad.t + chartH}`
    : '';
  const targetY = yP(target);

  const gained = sorted.length >= 2 ? sorted[sorted.length-1].weight - sorted[0].weight : null;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16 }}>

      {/* Log weight */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.14), rgba(167,139,250,0.04))',
        border: '1.5px solid rgba(167,139,250,0.25)',
        borderRadius: 14,
        padding: '16px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: 0.5, marginBottom: 12 }}>LOG TODAY'S WEIGHT</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="30"
            max="250"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. 84.5"
            style={{ flex: 1 }}
            onKeyDown={e => e.key === 'Enter' && logWeight()}
          />
          <span style={{ color: '#666', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>kg</span>
          <button
            onClick={logWeight}
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
              color: '#fff',
              borderRadius: 9,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >Log</button>
        </div>

        {latest && (
          <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: '#a78bfa', letterSpacing: 1 }}>{latest.weight}kg</div>
              <div style={{ fontSize: 10, color: '#555', fontWeight: 700 }}>LATEST</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: '#f5f5f5', letterSpacing: 1 }}>{Math.max(0, target - latest.weight).toFixed(1)}kg</div>
              <div style={{ fontSize: 10, color: '#555', fontWeight: 700 }}>TO TARGET</div>
            </div>
            {gained !== null && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: gained >= 0 ? '#22c55e' : '#ef4444', letterSpacing: 1 }}>
                  {gained >= 0 ? '+' : ''}{gained.toFixed(1)}kg
                </div>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 700 }}>TOTAL GAIN</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk target setting */}
      <div style={{
        background: '#181818',
        border: '1.5px solid #2a2a2a',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 18 }}>🎯</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 0.5 }}>BULK TARGET</div>
          {editTarget ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input type="number" inputMode="decimal" step="0.5" value={targetInput} onChange={e => setTargetInput(e.target.value)} style={{ width: 90 }} />
              <button onClick={saveTarget} style={{ background: '#22c55e', color: '#fff', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>Save</button>
            </div>
          ) : (
            <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: '#f5f5f5', letterSpacing: 1, marginTop: 2 }}>{target}kg</div>
          )}
        </div>
        <button
          onClick={() => setEditTarget(!editTarget)}
          style={{ background: '#2a2a2a', color: '#888', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}
        >{editTarget ? 'Cancel' : 'Edit'}</button>
      </div>

      {/* Chart */}
      {sorted.length >= 2 ? (
        <div style={{
          background: '#181818',
          border: '1.5px solid #2a2a2a',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>WEIGHT TREND</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const v = minVal + f * range;
              const y = yP(v);
              return (
                <g key={f}>
                  <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#222" strokeWidth="1" />
                  <text x={pad.l - 4} y={y + 4} fontSize="9" fill="#444" textAnchor="end">{Math.round(v)}</text>
                </g>
              );
            })}

            {/* Target line */}
            <line x1={pad.l} y1={targetY} x2={W - pad.r} y2={targetY}
              stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.5" />
            <text x={W - pad.r + 2} y={targetY + 4} fontSize="9" fill="#a78bfa">{target}</text>

            {/* Area */}
            <polygon points={areaPoints} fill="url(#wgrad)" />

            {/* Line */}
            <polyline points={linePoints} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinejoin="round" />

            {/* Dots */}
            {sorted.map((b, i) => (
              <circle key={i} cx={xP(i)} cy={yP(b.weight)} r="3.5"
                fill="#a78bfa" stroke="#0f0f0f" strokeWidth="1.5" />
            ))}

            {/* X axis labels */}
            {sorted.map((b, i) => {
              if (sorted.length > 6 && i % Math.ceil(sorted.length / 6) !== 0) return null;
              const d = new Date(b.date + 'T12:00:00');
              return (
                <text key={i} x={xP(i)} y={H - 4} fontSize="8" fill="#444" textAnchor="middle">
                  {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </text>
              );
            })}
          </svg>
        </div>
      ) : sorted.length === 1 ? (
        <div style={{ textAlign: 'center', color: '#555', padding: '20px 0', fontSize: 13 }}>
          Log one more weigh-in to see your trend
        </div>
      ) : null}

      {/* History */}
      {sorted.length > 0 && (
        <div style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>HISTORY</div>
          {[...sorted].reverse().map(entry => (
            <div key={entry.date} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '9px 0',
              borderBottom: '1px solid #222',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{entry.weight}kg</div>
                <div style={{ fontSize: 11, color: '#555' }}>{formatDate(entry.date)}</div>
              </div>
              <div style={{ fontSize: 12, color: entry.weight >= target ? '#22c55e' : '#a78bfa', fontWeight: 700, marginRight: 12 }}>
                {entry.weight >= target ? '✅ At target' : `${(target - entry.weight).toFixed(1)}kg to go`}
              </div>
              <button
                onClick={() => deleteEntry(entry.date)}
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 6, padding: '4px 8px', fontSize: 11 }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
