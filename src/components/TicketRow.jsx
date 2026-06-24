import { TICKETS } from '../expData.js'

function TicketRow({ counts, totalExp, waste, singleTier }) {
  const ticketsToShow = singleTier ? TICKETS.filter((t) => t.id === singleTier) : TICKETS

  return (
    <div className="ticket-row">
      <div className="ticket-row__tickets">
        {ticketsToShow.map((ticket) => {
          const count = counts[ticket.id] ?? 0

          return (
            <div className="ticket-stub" key={ticket.id}>
              <img
                className="ticket-stub__image"
                src={`${import.meta.env.BASE_URL}${ticket.image}`}
                alt={ticket.name}
                width={64}
                height={64}
              />
              <div className="ticket-stub__info">
                <span className="ticket-stub__tier">{ticket.short}</span>
                <span className="ticket-stub__count">
                  <strong>×{count}</strong>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <dl className="ticket-row__totals">
        <div>
          <dt>EXP from these tickets</dt>
          <dd>{totalExp.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Overshoot (wasted EXP)</dt>
          <dd className={waste > 0 ? 'waste-value' : 'waste-value waste-value--zero'}>
            {waste > 0 ? `+${waste.toLocaleString()}` : '0'}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default TicketRow
