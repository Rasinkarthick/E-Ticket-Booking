import React from 'react';
import { Clock, Users, ArrowRight } from 'lucide-react';

export const TrainCard = ({ train, onSelectTrain }) => {
  const dep = new Date(train.departure_time);
  const arr = new Date(train.arrival_time);
  
  // Format times
  const depTimeStr = dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrTimeStr = arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const depDateStr = dep.toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Calculate duration
  const diffHours = ((arr - dep) / (1000 * 60 * 60)).toFixed(1);

  // Seat status
  const isSoldOut = train.available_seats <= 0;
  const isLow = train.available_seats <= 5 && !isSoldOut;

  return (
    <div className="train-card">
      <div>
        <div className="train-card-header">
          <div className="train-title-group">
            <h3>{train.train_name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {train.train_number} • High-Speed Rail
            </span>
          </div>
          <span className="train-badge-pnr">${train.fare || 45} / seat</span>
        </div>

        {/* Route Timeline */}
        <div className="route-timeline">
          <div className="station-point">
            <div className="station-time">{depTimeStr}</div>
            <div className="station-name">{train.source}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>{depDateStr}</div>
          </div>

          <div className="route-connector">
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {diffHours}h direct
            </span>
            <div className="connector-line"></div>
          </div>

          <div className="station-point dest">
            <div className="station-time">{arrTimeStr}</div>
            <div className="station-name">{train.destination}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Arrival</div>
          </div>
        </div>
      </div>

      <div className="train-card-footer">
        <div className="seats-badge">
          <Users size={16} />
          <span className={isSoldOut ? 'seats-soldout' : isLow ? 'seats-low' : 'seats-available'}>
            {isSoldOut ? 'Sold Out' : `${train.available_seats} seats left`}
          </span>
        </div>

        <button 
          className="btn btn-primary btn-sm"
          disabled={isSoldOut}
          onClick={() => onSelectTrain(train)}
          style={{ opacity: isSoldOut ? 0.6 : 1, cursor: isSoldOut ? 'not-allowed' : 'pointer' }}
        >
          {isSoldOut ? 'Unavailable' : 'Book Seat'}
          {!isSoldOut && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
};
