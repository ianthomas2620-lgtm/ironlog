export const STORAGE_KEY = 'ironlog-v2';

export const DEFAULT_EXERCISES = [
  { id: 'incline-bp',       name: 'Incline Bench Press',  category: 'Push' },
  { id: 'flat-bp',          name: 'Flat Bench Press',     category: 'Push' },
  { id: 'ohp',              name: 'Overhead Press',       category: 'Push' },
  { id: 'cable-fly',        name: 'Cable Fly',            category: 'Push' },
  { id: 'lateral-raise',    name: 'Lateral Raise',        category: 'Push' },
  { id: 'tricep-pushdown',  name: 'Tricep Pushdown',      category: 'Push' },
  { id: 'pull-up',          name: 'Pull-Up',              category: 'Pull' },
  { id: 'barbell-row',      name: 'Barbell Row',          category: 'Pull' },
  { id: 'lat-pulldown',     name: 'Lat Pulldown',         category: 'Pull' },
  { id: 'face-pull',        name: 'Face Pull',            category: 'Pull' },
  { id: 'bicep-curl',       name: 'Bicep Curl',           category: 'Pull' },
  { id: 'hammer-curl',      name: 'Hammer Curl',          category: 'Pull' },
  { id: 'squat',            name: 'Squat',                category: 'Legs' },
  { id: 'rdl',              name: 'Romanian Deadlift',    category: 'Legs' },
  { id: 'leg-press',        name: 'Leg Press',            category: 'Legs' },
  { id: 'leg-curl',         name: 'Leg Curl',             category: 'Legs' },
  { id: 'leg-extension',    name: 'Leg Extension',        category: 'Legs' },
  { id: 'calf-raise',       name: 'Calf Raise',           category: 'Legs' },
];

export const CAT_COLOR = {
  Push: '#ff6b35',
  Pull: '#00c9a7',
  Legs: '#a78bfa',
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], exercises: DEFAULT_EXERCISES };
    return JSON.parse(raw);
  } catch {
    return { sessions: [], exercises: DEFAULT_EXERCISES };
  }
}

export function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Returns the most recent session for a given exercise
export function getLastSession(sessions, exerciseId) {
  return sessions
    .filter(s => s.exercises?.some(e => e.exerciseId === exerciseId))
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
}

// Progressive overload target based on last session
// Rule: if ALL sets hit >= repTarget, bump weight by increment; else add 1 rep
export function getTarget(sessions, exerciseId, repTarget = 12, increment = 2.5) {
  const last = getLastSession(sessions, exerciseId);
  if (!last) return null;
  const ex = last.exercises.find(e => e.exerciseId === exerciseId);
  if (!ex || !ex.sets.length) return null;

  const sets = ex.sets.filter(s => s.reps > 0);
  if (!sets.length) return null;

  const allHitTarget = sets.every(s => s.reps >= repTarget);
  const avgWeight = sets.reduce((a, b) => a + b.weight, 0) / sets.length;
  const avgReps = sets.reduce((a, b) => a + b.reps, 0) / sets.length;

  if (allHitTarget) {
    return {
      weight: Math.round((avgWeight + increment) * 2) / 2,
      reps: 8,
      note: `+${increment}kg — you earned it`,
      type: 'weight',
    };
  } else {
    const targetReps = Math.min(Math.ceil(avgReps) + 1, repTarget);
    return {
      weight: avgWeight,
      reps: targetReps,
      note: `+1 rep — push to ${targetReps}`,
      type: 'reps',
    };
  }
}

// 1RM estimate (Epley)
export function oneRM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Volume for a set of sets
export function totalVolume(sets) {
  return sets.reduce((a, s) => a + s.weight * s.reps, 0);
}

// History for chart: last N sessions with this exercise
export function getHistory(sessions, exerciseId, n = 8) {
  return sessions
    .filter(s => s.exercises?.some(e => e.exerciseId === exerciseId))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-n)
    .map(s => {
      const ex = s.exercises.find(e => e.exerciseId === exerciseId);
      const sets = ex?.sets.filter(st => st.reps > 0) || [];
      const bestSet = sets.reduce((best, st) => oneRM(st.weight, st.reps) > oneRM(best.weight, best.reps) ? st : best, sets[0] || { weight: 0, reps: 0 });
      return {
        date: s.date,
        e1rm: sets.length ? oneRM(bestSet.weight, bestSet.reps) : 0,
        volume: totalVolume(sets),
        topWeight: bestSet.weight,
      };
    });
}
