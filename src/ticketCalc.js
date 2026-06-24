import { TICKETS } from './expData.js'

export function calcPreciseTickets(expNeeded) {
  if (expNeeded <= 0) {
    return { counts: { 1: 0, 2: 0, 3: 0, 4: 0 }, totalExp: 0, waste: 0 }
  }

  const denoms = [3000, 1000, 200, 50] // IV, III, II, I
  const WINDOW = 3 // search a small range around the greedy estimate at each tier

  let best = null

  const greedyIV = Math.floor(expNeeded / denoms[0])
  const loIV = Math.max(0, greedyIV - WINDOW)
  const hiIV = greedyIV + WINDOW

  for (let nIV = loIV; nIV <= hiIV; nIV++) {
    const remAfterIV = expNeeded - nIV * denoms[0]
    if (remAfterIV < 0) {
      const waste = -remAfterIV
      if (!best || waste < best.waste) {
        best = { counts: { 1: 0, 2: 0, 3: 0, 4: nIV }, totalExp: nIV * denoms[0], waste }
      }
      continue
    }

    const greedyIII = Math.floor(remAfterIV / denoms[1])
    const loIII = Math.max(0, greedyIII - WINDOW)
    const hiIII = greedyIII + WINDOW

    for (let nIII = loIII; nIII <= hiIII; nIII++) {
      const remAfterIII = remAfterIV - nIII * denoms[1]
      if (remAfterIII < 0) {
        const totalExp = nIV * denoms[0] + nIII * denoms[1]
        const waste = totalExp - expNeeded
        if (waste >= 0 && (!best || waste < best.waste)) {
          best = { counts: { 1: 0, 2: 0, 3: nIII, 4: nIV }, totalExp, waste }
        }
        continue
      }

      const greedyII = Math.floor(remAfterIII / denoms[2])
      const loII = Math.max(0, greedyII - WINDOW)
      const hiII = greedyII + WINDOW

      for (let nII = loII; nII <= hiII; nII++) {
        const remAfterII = remAfterIII - nII * denoms[2]
        if (remAfterII <= 0) {
          const totalExp = nIV * denoms[0] + nIII * denoms[1] + nII * denoms[2]
          const waste = totalExp - expNeeded
          if (waste >= 0 && (!best || waste < best.waste)) {
            best = { counts: { 1: 0, 2: nII, 3: nIII, 4: nIV }, totalExp, waste }
          }
          continue
        }
        const nI = Math.ceil(remAfterII / denoms[3])
        const totalExp = nIV * denoms[0] + nIII * denoms[1] + nII * denoms[2] + nI * denoms[3]
        const waste = totalExp - expNeeded
        if (!best || waste < best.waste) {
          best = { counts: { 1: nI, 2: nII, 3: nIII, 4: nIV }, totalExp, waste }
        }
      }
    }
  }

  return best
}

export function calcTierFourOnly(expNeeded) {
  if (expNeeded <= 0) {
    return { counts: { 1: 0, 2: 0, 3: 0, 4: 0 }, totalExp: 0, waste: 0 }
  }
  const tierFour = TICKETS.find((t) => t.id === 4)
  const count = Math.ceil(expNeeded / tierFour.exp)
  const totalExp = count * tierFour.exp
  return { counts: { 1: 0, 2: 0, 3: 0, 4: count }, totalExp, waste: totalExp - expNeeded }
}
