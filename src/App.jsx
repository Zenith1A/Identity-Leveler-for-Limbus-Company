import { useEffect, useMemo, useState } from 'react'
import { MAX_LEVEL, expBetweenWithProgress, expToNextLevel, TICKETS } from './expData.js'
import { calcPreciseTickets, calcTierFourOnly } from './ticketCalc.js'
import TicketRow from './components/TicketRow.jsx'
import LevelInput from './components/LevelInput.jsx'
import IdentityRow from './components/IdentityRow.jsx'

import './App.css'

const EMPTY_OWNED = { 1: 0, 2: 0, 3: 0, 4: 0 }

function makeIdentity(overrides = {}) {
  return {
    name: '',
    currentLevel: 1,
    currentExp: 0,
    targetLevel: 45,
    ...overrides,
  }
}

function App() {
  const [showRarePopup, setShowRarePopup] = useState(false)

  useEffect(() => {
    // 1% chance to show a different background for fun
    if (Math.random() < 0.01) {
      document.body.classList.add('alt-background')
      setShowRarePopup(true)
    }

    return () => document.body.classList.remove('alt-background')
  }, [])

  const [mode, setMode] = useState('single') // 'single' | 'bulk'

  // ---- Single mode state ----
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentExp, setCurrentExp] = useState(0)
  const [targetLevel, setTargetLevel] = useState(45)

  // ---- Bulk mode state ----
  const [identities, setIdentities] = useState([makeIdentity(), makeIdentity()])

  // ---- Owned tickets (shared by both modes) ----
  const [showOwned, setShowOwned] = useState(false)
  const [owned, setOwned] = useState(EMPTY_OWNED)

  const expCapSingle = expToNextLevel(currentLevel)
  const isValidRange = targetLevel > currentLevel

  // Total EXP needed across whichever mode is active.
  const expNeeded = useMemo(() => {
    if (mode === 'single') {
      return isValidRange ? expBetweenWithProgress(currentLevel, targetLevel, currentExp) : 0
    }
    return identities.reduce((sum, id) => {
      const cur = Number(id.currentLevel) || 1
      const tgt = Number(id.targetLevel) || 1
      const exp = Number(id.currentExp) || 0
      if (tgt <= cur) return sum
      return sum + expBetweenWithProgress(cur, tgt, exp)
    }, 0)
  }, [mode, currentLevel, targetLevel, currentExp, identities, isValidRange])

  const anyValidInBulk = useMemo(
    () => identities.some((id) => Number(id.targetLevel) > Number(id.currentLevel)),
    [identities],
  )

  const hasValidInput = mode === 'single' ? isValidRange : anyValidInBulk

  const ownedExpValue = useMemo(
    () =>
      Object.entries(owned).reduce((sum, [tier, count]) => {
        const t = TICKETS.find((tk) => tk.id === Number(tier))
        return sum + (t ? t.exp * (count || 0) : 0)
      }, 0),
    [owned],
  )

  const remainingExp = useMemo(
    () => (showOwned ? Math.max(0, expNeeded - ownedExpValue) : expNeeded),
    [expNeeded, ownedExpValue, showOwned],
  )

  const precise = useMemo(() => calcPreciseTickets(remainingExp), [remainingExp])
  const tierFour = useMemo(() => calcTierFourOnly(remainingExp), [remainingExp])

  function handleOwnedChange(tierId, value) {
    const n = Math.max(0, parseInt(value, 10) || 0)
    setOwned((prev) => ({ ...prev, [tierId]: n }))
  }

  function resetOwned() {
    setOwned(EMPTY_OWNED)
  }

  function updateIdentity(index, next) {
    setIdentities((prev) => prev.map((id, i) => (i === index ? next : id)))
  }

  function addIdentity() {
    setIdentities((prev) => [...prev, makeIdentity()])
  }

  function removeIdentity(index) {
    setIdentities((prev) => prev.filter((_, i) => i !== index))
  }

  function clampCurrentExp(value, cap) {
    return Math.max(0, Math.min(value, cap))
  }

  return (
    
    <div className="page">
      {showRarePopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2>YOU ARE LUCKY!</h2>
              <p>You hit the 1% chance background. Pull NOW!</p>
              <button onClick={() => setShowRarePopup(false)}>
                ...
              </button>
            </div>
          </div>
        )}
      <div className="grain-overlay" />

      <header className="masthead">
        <div className="masthead__ticket-edge" aria-hidden="true" />
        <p className="masthead__eyebrow">LCB · Identity Exprience Calculator</p>
        <h1 className="masthead__title">Exprience Calculator</h1>
        <p className="masthead__subtitle">
          Calculate the exact EXP and Training Tickets required to advance an Identity from one level to another. For better resource management.
        </p>
      </header>
      
      <main className="layout">
        <section className="panel panel--input" aria-labelledby="levels-heading">
          <div className="panel__header-row">
            <h2 id="levels-heading" className="panel__heading">
              <span className="panel__heading-number">01</span> Set Levels
            </h2>
            <div className="mode-toggle" role="tablist" aria-label="Calculator mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'single'}
                className={`mode-toggle__btn ${mode === 'single' ? 'mode-toggle__btn--active' : ''}`}
                onClick={() => setMode('single')}
              >
                Single
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'bulk'}
                className={`mode-toggle__btn ${mode === 'bulk' ? 'mode-toggle__btn--active' : ''}`}
                onClick={() => setMode('bulk')}
              >
                Bulk
              </button>
            </div>
          </div>

          {mode === 'single' ? (
            <>
              <div className="level-inputs">
                <LevelInput
                  id="current-level"
                  label="Current Level"
                  value={currentLevel}
                  onChange={(v) => {
                    setCurrentLevel(v)
                    setCurrentExp((prev) => clampCurrentExp(prev, expToNextLevel(v)))
                  }}
                  min={1}
                  max={MAX_LEVEL}
                />
                <div className="level-arrow" aria-hidden="true">→</div>
                <LevelInput
                  id="target-level"
                  label="Desired Level"
                  value={targetLevel}
                  onChange={setTargetLevel}
                  min={1}
                  max={MAX_LEVEL}
                />
              </div>

              <div className="current-exp-field">
                <label htmlFor="current-exp" className="current-exp-field__label">
                  EXP already earned past Level {currentLevel}
                  {expCapSingle > 0 && <span className="current-exp-field__cap"> (max {expCapSingle.toLocaleString()})</span>}
                </label>
                <input
                  id="current-exp"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={expCapSingle}
                  value={currentExp}
                  onChange={(e) => setCurrentExp(e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0)}
                  onBlur={() => setCurrentExp((prev) => clampCurrentExp(parseInt(prev, 10) || 0, expCapSingle))}
                  disabled={expCapSingle === 0}
                  placeholder="0"
                />
              </div>

              {!isValidRange && <p className="warning-text">Desired level must be higher than current level.</p>}
            </>
          ) : (
            <div className="id-list">
              {identities.map((identity, index) => (
                <IdentityRow
                  key={index}
                  index={index}
                  identity={identity}
                  onChange={(next) => updateIdentity(index, next)}
                  onRemove={() => removeIdentity(index)}
                  canRemove={identities.length > 1}
                />
              ))}
              <button type="button" className="id-list__add" onClick={addIdentity}>
                + Add Another Identity
              </button>
            </div>
          )}

          <div className="exp-readout">
            <span className="exp-readout__label">
              {mode === 'bulk' ? 'Total EXP Required (all Identities)' : 'Total EXP Required'}
            </span>
            <span className="exp-readout__value">{hasValidInput ? expNeeded.toLocaleString() : '—'}</span>
          </div>
        </section>

        <section className="panel panel--owned" aria-labelledby="owned-heading">
          <button
            type="button"
            className="owned-toggle"
            onClick={() => setShowOwned((s) => !s)}
            aria-expanded={showOwned}
          >
            <h2 id="owned-heading" className="panel__heading">
              <span className="panel__heading-number">02</span> Tickets You Already Have
            </h2>
            <span className="owned-toggle__chevron">{showOwned ? '−' : '+'}</span>
          </button>

          {showOwned && (
            <div className="owned-grid">
              {TICKETS.map((ticket) => (
                <div className="owned-field" key={ticket.id}>
                  <img
                    className="owned-field__icon"
                    src={`${import.meta.env.BASE_URL}${ticket.image}`}
                    alt={ticket.name}
                    width={40}
                    height={40}
                  />
                  <label htmlFor={`owned-${ticket.id}`} className="owned-field__label">
                    {ticket.short}
                  </label>
                  <input
                    id={`owned-${ticket.id}`}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    className="owned-field__input"
                    value={owned[ticket.id]}
                    onChange={(e) => handleOwnedChange(ticket.id, e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="owned-reset" onClick={resetOwned}>
                Clear
              </button>
            </div>
          )}

          {showOwned && ownedExpValue > 0 && (
            <p className="owned-summary">
              Your stock is worth <strong>{ownedExpValue.toLocaleString()} EXP</strong> — that leaves{' '}
              <strong>{remainingExp.toLocaleString()} EXP</strong> still needed.
            </p>
          )}
        </section>

        {hasValidInput && (
          <>
            <section className="panel panel--strategy" aria-labelledby="precise-heading">
              <h2 id="precise-heading" className="panel__heading">
                <span className="panel__heading-number">03</span> Precise Mix — All Four Tiers
              </h2>
              <p className="panel__description">
                {showOwned
                  ? `After using what you already have, here's the additional ticket mix — across all tiers — that covers the rest with the least EXP wasted.`
                  : mode === 'bulk'
                    ? `The combination of tickets across all tiers that covers every Identity above, combined, with the least EXP wasted.`
                    : `The combination of tickets across all tiers that gets you to level ${targetLevel} with the least possible EXP wasted.`}
              </p>
              <TicketRow counts={precise.counts} totalExp={precise.totalExp} waste={precise.waste} />
            </section>

            <section className="panel panel--strategy" aria-labelledby="tier4-heading">
              <h2 id="tier4-heading" className="panel__heading">
                <span className="panel__heading-number">04</span> Simple Mix — Tier IV Only
              </h2>
              <p className="panel__description">
                {showOwned
                  ? `If you'd rather just burn through Tier IV tickets for the remainder, here's how many more you'd need.`
                  : `If you'd rather not juggle four ticket types, here's how many Tier IV tickets alone would get the job done.`}
              </p>
              <TicketRow
                counts={tierFour.counts}
                totalExp={tierFour.totalExp}
                waste={tierFour.waste}
                singleTier={4}
              />
            </section>
          </>
        )}
      </main>

      <footer className="page-footer">
        <p>
          EXP curve and ticket values compiled from community-verified in-game data. Levels 1–45 follow the
          documented exponential curve; 46–60 follow the linear post-Canto-V pattern.
        </p>
      </footer>
    </div>
  )
}

export default App