import { MAX_LEVEL, expToNextLevel } from '../expData.js'

function IdentityRow({ identity, onChange, onRemove, canRemove, index }) {
  const { name, currentLevel, currentExp, targetLevel } = identity
  const expCap = expToNextLevel(currentLevel)

  function update(field, value) {
    onChange({ ...identity, [field]: value })
  }

  function handleLevelField(field, raw, min, max) {
    if (raw === '') {
      update(field, '')
      return
    }
    const n = parseInt(raw, 10)
    if (Number.isNaN(n)) return
    update(field, n)
  }

  function clampOnBlur(field, min, max) {
    let n = parseInt(identity[field], 10)
    if (Number.isNaN(n)) n = min
    n = Math.max(min, Math.min(max, n))
    update(field, n)
  }

  const isValidRange = targetLevel > currentLevel

  return (
    <div className="id-row">
      <div className="id-row__header">
        <input
          type="text"
          className="id-row__name"
          value={name}
          placeholder={`Identity ${index + 1}`}
          onChange={(e) => update('name', e.target.value)}
          aria-label="Identity name"
        />
        {canRemove && (
          <button
            type="button"
            className="id-row__remove"
            onClick={onRemove}
            aria-label="Remove this identity"
            title="Remove"
          >
            ×
          </button>
        )}
      </div>

      <div className="id-row__fields">
        <div className="id-row__field">
          <label className="id-row__label">Current Lvl</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_LEVEL}
            value={currentLevel}
            onChange={(e) => handleLevelField('currentLevel', e.target.value, 1, MAX_LEVEL)}
            onBlur={() => clampOnBlur('currentLevel', 1, MAX_LEVEL)}
          />
        </div>

        <div className="id-row__field">
          <label className="id-row__label">
            Current EXP {expCap > 0 && <span className="id-row__cap">/ {expCap}</span>}
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={expCap}
            value={currentExp}
            onChange={(e) => handleLevelField('currentExp', e.target.value, 0, expCap)}
            onBlur={() => clampOnBlur('currentExp', 0, expCap)}
            disabled={expCap === 0}
          />
        </div>

        <span className="id-row__arrow" aria-hidden="true">→</span>

        <div className="id-row__field">
          <label className="id-row__label">Target Lvl</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_LEVEL}
            value={targetLevel}
            onChange={(e) => handleLevelField('targetLevel', e.target.value, 1, MAX_LEVEL)}
            onBlur={() => clampOnBlur('targetLevel', 1, MAX_LEVEL)}
          />
        </div>
      </div>

      {!isValidRange && <p className="id-row__warning">Target must be higher than current level.</p>}
    </div>
  )
}

export default IdentityRow
