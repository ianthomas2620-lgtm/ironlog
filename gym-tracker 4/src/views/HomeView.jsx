import { todayStr, formatDate, totalVolume, hexToRgb } from '../data.js';

export default function HomeView({ data, onStartDay }) {
  const today = todayStr();
  const todaySession = data.sessions.find(s => s.date === today);

  // Last 7 days streak
  const streak = (() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const str = d.toISOString().split('T')[0];
      if (data.sessions.find(s => s.date === str)) count++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const totalSessions = data.sessions.length;
  const lastWeight = data.bodyweight.length
    ? data.bodyweight[data.bodyweight.length - 1].weight
    : null;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px' }}>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Streak', value: `${streak}d`, icon: '🔥', color: '#ff6b35' },
          { label: 'Sessions', value: totalSessions, icon: '💪', color: '#00c9a7' },
          { label: 'Weight', value: lastWeight ? `${lastWeight}kg` : '—', icon: '⚖️', color: '#a78bfa' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: `linear-gradient(135deg, rgba(${hexToRgb(stat.color)},0.15), rgba(${hexToRgb(stat.color)},0.05))`,
            border: `1.5px solid rgba(${hexToRgb(stat.color)},0.25)`,
            borderRadius: 12,
            padding: '14px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: stat.color, letterSpacing: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk Progress */}
      {lastWeight && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(167,139,250,0.04))',
          border: '1.5px solid rgba(167,139,250,0.2)',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bulk Target</div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: '#a78bfa', letterSpacing: 1, marginTop: 2 }}>
                {lastWeight}kg → {data.bulkTarget}kg
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', color: '#f5f5f5' }}>
                {Math.max(0, data.bulkTarget - lastWeight).toFixed(1)}kg
              </div>
              <div style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>TO GO</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background: '#222', borderRadius: 99, height: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (lastWeight / data.bulkTarget) * 100)}%`,
              background: 'linear-gradient(90deg, #a78bfa, #ec4899)',
              borderRadius: 99,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#555' }}>Start</span>
            <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700 }}>
              {Math.round((lastWeight / data.bulkTarget) * 100)}%
            </span>
            <span style={{ fontSize: 10, color: '#555' }}>{data.bulkTarget}kg</span>
          </div>
        </div>
      )}

      {/* Today's status */}
      {todaySession ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
          border: '1.5px solid rgba(34,197,94,0.25)',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>Trained today</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {todaySession.exercises.length} exercises · {todaySession.exercises.reduce((a,e)=>a+totalVolume(e.sets),0).toFixed(0)}kg volume
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))',
          border: '1.5px solid rgba(255,107,53,0.25)',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ff6b35' }}>No session logged today</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Pick a day below and get started</div>
          </div>
        </div>
      )}

      {/* 6-Day Split */}
      <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
        Your Split
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.split.map((day, i) => {
          const rgb = hexToRgb(day.color);
          const recentSession = data.sessions
            .filter(s => s.dayId === day.id)
            .sort((a,b) => new Date(b.date) - new Date(a.date))[0];

          return (
            <button
              key={day.id}
              onClick={() => onStartDay(day)}
              className="fade-up"
              style={{
                background: `linear-gradient(135deg, rgba(${rgb},0.14) 0%, rgba(${rgb},0.05) 100%)`,
                border: `1.5px solid rgba(${rgb},0.25)`,
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `rgba(${rgb},0.2)`,
                border: `1.5px solid rgba(${rgb},0.3)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                color: day.color,
                letterSpacing: 1,
                flexShrink: 0,
              }}>D{i + 1}</div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: day.color }}>{day.name}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                  {day.exerciseIds.length} exercises
                  {recentSession ? ` · Last: ${formatDate(recentSession.date)}` : ' · Not trained yet'}
                </div>
              </div>

              <span style={{ color: day.color, fontSize: 18 }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
