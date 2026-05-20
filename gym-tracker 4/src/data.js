// ─── EXERCISE LIBRARY ───────────────────────────────────────────────────────

export const EXERCISE_LIBRARY = [
  // PUSH
  { id: 'incline-bp',      name: 'Incline Bench Press',   category: 'Push', type: 'compound' },
  { id: 'flat-bp',         name: 'Flat Bench Press',      category: 'Push', type: 'compound' },
  { id: 'ohp',             name: 'Overhead Press',        category: 'Push', type: 'compound' },
  { id: 'dips',            name: 'Dips',                  category: 'Push', type: 'compound' },
  { id: 'incline-db',      name: 'Incline DB Press',      category: 'Push', type: 'compound' },
  { id: 'cable-fly',       name: 'Cable Fly',             category: 'Push', type: 'isolation' },
  { id: 'lateral-raise',   name: 'Lateral Raise',         category: 'Push', type: 'isolation' },
  { id: 'front-raise',     name: 'Front Raise',           category: 'Push', type: 'isolation' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown',       category: 'Push', type: 'isolation' },
  { id: 'skull-crusher',   name: 'Skull Crusher',         category: 'Push', type: 'isolation' },
  { id: 'overhead-tri',    name: 'Overhead Tricep Ext',   category: 'Push', type: 'isolation' },
  // PULL
  { id: 'pull-up',         name: 'Pull-Up',               category: 'Pull', type: 'compound' },
  { id: 'barbell-row',     name: 'Barbell Row',           category: 'Pull', type: 'compound' },
  { id: 'deadlift',        name: 'Deadlift',              category: 'Pull', type: 'compound' },
  { id: 'lat-pulldown',    name: 'Lat Pulldown',          category: 'Pull', type: 'compound' },
  { id: 'seated-row',      name: 'Seated Cable Row',      category: 'Pull', type: 'compound' },
  { id: 'face-pull',       name: 'Face Pull',             category: 'Pull', type: 'isolation' },
  { id: 'bicep-curl',      name: 'Barbell Curl',          category: 'Pull', type: 'isolation' },
  { id: 'db-curl',         name: 'Dumbbell Curl',         category: 'Pull', type: 'isolation' },
  { id: 'hammer-curl',     name: 'Hammer Curl',           category: 'Pull', type: 'isolation' },
  { id: 'incline-curl',    name: 'Incline DB Curl',       category: 'Pull', type: 'isolation' },
  { id: 'rear-delt-fly',   name: 'Rear Delt Fly',        category: 'Pull', type: 'isolation' },
  // LEGS
  { id: 'squat',           name: 'Squat',                 category: 'Legs', type: 'compound' },
  { id: 'rdl',             name: 'Romanian Deadlift',     category: 'Legs', type: 'compound' },
  { id: 'leg-press',       name: 'Leg Press',             category: 'Legs', type: 'compound' },
  { id: 'bulgarian',       name: 'Bulgarian Split Squat', category: 'Legs', type: 'compound' },
  { id: 'hack-squat',      name: 'Hack Squat',            category: 'Legs', type: 'compound' },
  { id: 'leg-curl',        name: 'Leg Curl',              category: 'Legs', type: 'isolation' },
  { id: 'leg-extension',   name: 'Leg Extension',         category: 'Legs', type: 'isolation' },
  { id: 'calf-raise',      name: 'Calf Raise',            category: 'Legs', type: 'isolation' },
  { id: 'hip-thrust',      name: 'Hip Thrust',            category: 'Legs', type: 'compound' },
  // CHEST & BACK
  { id: 'weighted-dips',   name: 'Weighted Dips',         category: 'Chest & Back', type: 'compound' },
  { id: 'db-bench',        name: 'DB Bench Press',        category: 'Chest & Back', type: 'compound' },
  { id: 'chest-press',     name: 'Machine Chest Press',   category: 'Chest & Back', type: 'compound' },
  { id: 'cable-crossover', name: 'Cable Crossover',       category: 'Chest & Back', type: 'isolation' },
  { id: 'db-row',          name: 'DB Row',                category: 'Chest & Back', type: 'compound' },
  { id: 'tbar-row',        name: 'T-Bar Row',             category: 'Chest & Back', type: 'compound' },
  { id: 'straight-arm-pd', name: 'Straight Arm Pulldown', category: 'Chest & Back', type: 'isolation' },
  { id: 'chest-supported', name: 'Chest Supported Row',   category: 'Chest & Back', type: 'compound' },
  // ARMS & SHOULDERS
  { id: 'close-grip-bp',   name: 'Close Grip Bench',      category: 'Arms & Shoulders', type: 'compound' },
  { id: 'preacher-curl',   name: 'Preacher Curl',         category: 'Arms & Shoulders', type: 'isolation' },
  { id: 'cable-curl',      name: 'Cable Curl',            category: 'Arms & Shoulders', type: 'isolation' },
  { id: 'tri-dip',         name: 'Tricep Dip (bench)',    category: 'Arms & Shoulders', type: 'isolation' },
  { id: 'arnold-press',    name: 'Arnold Press',          category: 'Arms & Shoulders', type: 'compound' },
  { id: 'db-lateral',      name: 'DB Lateral Raise',      category: 'Arms & Shoulders', type: 'isolation' },
  { id: 'cable-lateral',   name: 'Cable Lateral Raise',   category: 'Arms & Shoulders', type: 'isolation' },
  { id: 'shrugs',          name: 'Shrugs',                category: 'Arms & Shoulders', type: 'isolation' },
  { id: 'upright-row',     name: 'Upright Row',           category: 'Arms & Shoulders', type: 'compound' },
];

// ─── DEFAULT 6-DAY SPLIT ─────────────────────────────────────────────────────

export const DEFAULT_SPLIT = [
  {
    id: 'day1',
    name: 'Push',
    color: '#ff6b35',
    exerciseIds: ['incline-bp', 'ohp', 'cable-fly', 'lateral-raise', 'tricep-pushdown', 'overhead-tri'],
  },
  {
    id: 'day2',
    name: 'Pull',
    color: '#00c9a7',
    exerciseIds: ['pull-up', 'barbell-row', 'lat-pulldown', 'face-pull', 'bicep-curl', 'hammer-curl'],
  },
  {
    id: 'day3',
    name: 'Legs',
    color: '#a78bfa',
    exerciseIds: ['squat', 'rdl', 'leg-press', 'leg-curl', 'calf-raise'],
  },
  {
    id: 'day4',
    name: 'Chest & Back',
    color: '#f59e0b',
    exerciseIds: ['flat-bp', 'incline-db', 'db-row', 'tbar-row', 'cable-crossover', 'straight-arm-pd'],
  },
  {
    id: 'day5',
    name: 'Arms & Shoulders',
    color: '#ec4899',
    exerciseIds: ['close-grip-bp', 'preacher-curl', 'db-curl', 'arnold-press', 'db-lateral', 'cable-lateral'],
  },
  {
    id: 'day6',
    name: 'Legs',
    color: '#a78bfa',
    exerciseIds: ['hack-squat', 'bulgarian', 'leg-extension', 'leg-curl', 'hip-thrust', 'calf-raise'],
  },
];

// ─── PROGRESSION LOGIC ───────────────────────────────────────────────────────

// Increment per exercise type
export function getIncrement(exerciseId) {
  const ex = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
  return ex?.type === 'compound' ? 5 : 2.5;
}

/**
 * Given all past sessions and an exerciseId, return the progression target.
 * Logic:
 *  - Find the most recent session where this exercise was logged
 *  - Calculate avg reps across all sets
 *  - If avg reps >= peak reps seen historically → bump weight by increment, target minReps
 *  - Else → same weight, target avgReps + 1
 *  - If no history → return null
 */
export function getProgressionTarget(sessions, exerciseId) {
  const relevant = sessions
    .filter(s => s.exercises?.some(e => e.exerciseId === exerciseId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!relevant.length) return null;

  const lastSession = relevant[0];
  const lastEx = lastSession.exercises.find(e => e.exerciseId === exerciseId);
  const lastSets = lastEx?.sets.filter(s => s.reps > 0 && s.weight > 0) || [];
  if (!lastSets.length) return null;

  // What did they do last time?
  const lastAvgReps = lastSets.reduce((a, b) => a + b.reps, 0) / lastSets.length;
  const lastAvgWeight = lastSets.reduce((a, b) => a + b.weight, 0) / lastSets.length;
  const lastMaxReps = Math.max(...lastSets.map(s => s.reps));

  // Historical max reps at this weight
  const allSetsAtWeight = relevant
    .flatMap(s => s.exercises.find(e => e.exerciseId === exerciseId)?.sets || [])
    .filter(s => Math.abs(s.weight - lastAvgWeight) < 1);
  const historicMaxReps = allSetsAtWeight.length
    ? Math.max(...allSetsAtWeight.map(s => s.reps))
    : lastMaxReps;

  const increment = getIncrement(exerciseId);

  // If they hit the highest rep count they've ever done at this weight → add weight
  if (lastMaxReps >= historicMaxReps) {
    return {
      weight: Math.round((lastAvgWeight + increment) * 2) / 2,
      reps: Math.max(Math.round(lastAvgReps) - 2, 1),
      note: `+${increment}kg added — reset reps & push`,
      type: 'weight',
      lastWeight: lastAvgWeight,
      lastReps: Math.round(lastAvgReps),
    };
  } else {
    return {
      weight: lastAvgWeight,
      reps: Math.min(Math.ceil(lastAvgReps) + 1, lastMaxReps + 3),
      note: `+1 rep from last session`,
      type: 'reps',
      lastWeight: lastAvgWeight,
      lastReps: Math.round(lastAvgReps),
    };
  }
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const KEY = 'ironlog-v3';

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // Migrate if needed
    if (!parsed.split) parsed.split = DEFAULT_SPLIT;
    if (!parsed.bodyweight) parsed.bodyweight = [];
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveData(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

function defaultState() {
  return {
    sessions: [],
    split: DEFAULT_SPLIT,
    bodyweight: [],
    bulkTarget: 90,
  };
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(str) {
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function oneRM(weight, reps) {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function totalVolume(sets) {
  return sets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
}

export function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : '255,107,53';
}
