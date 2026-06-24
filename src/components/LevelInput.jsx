function LevelInput({ id, label, value, onChange, min, max }) {
  function handleChange(e) {
    const raw = e.target.value
    if (raw === '') {
      onChange('')
      return
    }
    const n = parseInt(raw, 10)
    if (Number.isNaN(n)) return
    onChange(n)
  }

  function handleBlur() {
    let n = parseInt(value, 10)
    if (Number.isNaN(n)) n = min
    n = Math.max(min, Math.min(max, n))
    onChange(n)
  }

  return (
    <div className="level-input">
      <label htmlFor={id} className="level-input__label">
        {label}
      </label>
      <div className="level-input__field">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <span className="level-input__suffix">/ {max}</span>
      </div>
      <input
        type="range"
        className="level-input__slider"
        min={min}
        max={max}
        value={value || min}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        aria-label={`${label} slider`}
      />
    </div>
  )
}

export default LevelInput
