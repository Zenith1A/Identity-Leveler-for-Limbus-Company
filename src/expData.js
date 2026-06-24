export const EXP_PER_LEVEL = [
  0, // index 0 unused
  0, // level 1 (start, costs nothing to "reach")
  10, 12, 15, 20, 27, 40, 59, 88, 125, // levels 2-10
  168, 227, 298, 381, 482, 591, 728, 885, 1064, 1261, // 11-20
  1488, 1739, 2016, 2327, 2674, 3047, 3456, 3899, 4378, 4899, // 21-30
  3899, 4376, 4899, 5468, 6075, // 31-35
  4899, 5469, 6075, 6722, 7413, // 36-40
  6075, 6722, 7413, 8156, 8953, // 41-45
  7413, 7413, 7413, 7413, 7413, // 46-50
  8156, 8156, 8156, 8156, 8156, // 51-55
  8953, 8953, 8953, 8953, 8953, // 56-60
]

export const MAX_LEVEL = 60

export const CUMULATIVE_EXP = (() => {
  const arr = [0]
  for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
    arr[lvl] = (arr[lvl - 1] ?? 0) + (EXP_PER_LEVEL[lvl] ?? 0)
  }
  return arr
})()

export function expBetween(currentLevel, targetLevel) {
  if (targetLevel <= currentLevel) return 0
  const cur = Math.max(1, Math.min(currentLevel, MAX_LEVEL))
  const tgt = Math.max(1, Math.min(targetLevel, MAX_LEVEL))
  return CUMULATIVE_EXP[tgt] - CUMULATIVE_EXP[cur]
}

export function expToNextLevel(currentLevel) {
  const lvl = Math.max(1, Math.min(currentLevel, MAX_LEVEL))
  if (lvl >= MAX_LEVEL) return 0
  return EXP_PER_LEVEL[lvl + 1] ?? 0
}

export function expBetweenWithProgress(currentLevel, targetLevel, currentExp = 0) {
  const total = expBetween(currentLevel, targetLevel)
  if (total <= 0) return 0
  const cap = expToNextLevel(currentLevel)
  const credited = Math.max(0, Math.min(currentExp || 0, cap))
  return Math.max(0, total - credited)
}

// Identity Training Ticket EXP values
export const TICKETS = [
  { id: 1, name: 'Identity Training Ticket I', short: 'Tier I', exp: 50, image: 'Identity_Training_Ticket_I.png' },
  { id: 2, name: 'Identity Training Ticket II', short: 'Tier II', exp: 200, image: 'Identity_Training_Ticket_II.png' },
  { id: 3, name: 'Identity Training Ticket III', short: 'Tier III', exp: 1000, image: 'Identity_Training_Ticket_III.png' },
  { id: 4, name: 'Identity Training Ticket IV', short: 'Tier IV', exp: 3000, image: 'Identity_Training_Ticket_IV.png' },
]