import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { X, CheckCircle2, AlertCircle, Train, ShieldCheck, CreditCard } from 'lucide-react';

export const BookSeatModal = ({ train, onClose, onBookingSuccess }) => {
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.getTrainAvailability(train._id);
        if (res.success) {
          setOccupiedSeats(res.booked_seat_numbers || []);
        }
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [train]);

  // Generate realistic seat layout: Coach A (Seats 1 to 24)
  const coachSeats = Array.from({ length: 24 }, (_, i) => {
    const seatNum = `A1-${String(i + 1).padStart(2, '0')}`;
    return {
      id: seatNum,
      isOccupied: occupiedSeats.includes(seatNum)
    };
  });

  const handleSeatClick = (seatId, isOccupied) => {
    if (isOccupied) return;
    setSelectedSeat(seatId);
    setErrorMessage(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeat) {
      setErrorMessage('Please select a seat from the seating chart.');
      return;
    }

    setBookingLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.bookTicket({
        train_id: train._id,
        seat_number: selectedSeat,
        fare: train.fare || 45
      });

      if (res.success) {
        onBookingSuccess(res.ticket);
      } else {
        setErrorMessage(res.message || 'Booking failed.');
      }
    } catch (err) {
      setErrorMessage('Network error while booking ticket.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Select Seat & Confirm Reservation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {train.train_name} ({train.train_number}) • {train.source} to {train.destination}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMessage && (
            <div className="alert-box alert-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seat Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-box available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-box selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-box occupied"></div>
              <span>Occupied</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            ▲ Coach A1 (Forward Direction)
          </div>

          {/* Interactive Seat Chart */}
          {loadingAvailability ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              Checking real-time seat availability...
            </div>
          ) : (
            <div className="coach-seats-container">
              {coachSeats.map((seat) => (
                <div
                  key={seat.id}
                  className={`seat-cell ${seat.isOccupied ? 'occupied' : ''} ${selectedSeat === seat.id ? 'selected' : ''}`}
                  onClick={() => handleSeatClick(seat.id, seat.isOccupied)}
                  title={seat.isOccupied ? `Seat ${seat.id} (Occupied)` : `Seat ${seat.id} (Available)`}
                >
                  {seat.id}
                </div>
              ))}
            </div>
          )}

          {/* Booking Summary Box */}
          <div style={{ background: 'var(--color-bg-app)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Selected Seat:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                {selectedSeat || 'None selected'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Ticket Fare:</span>
              <span style={{ fontWeight: 700 }}>${train.fare || 45}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)' }}>
              <span style={{ fontWeight: 700 }}>Initial Reservation Status:</span>
              <span className="status-chip status-Reserved">Reserved</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              * Per system architecture, your ticket will be set to 'Reserved' upon submission and confirmed/issued by the Administrator.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={bookingLoading}>
            Cancel
          </button>

          <button 
            className="btn btn-primary"
            disabled={!selectedSeat || bookingLoading}
            onClick={handleConfirmBooking}
          >
            <CreditCard size={16} />
            {bookingLoading ? 'Reserving Seat...' : `Confirm & Reserve ($${train.fare || 45})`}
          </button>
        </div>
      </div>
    </div>
  );
};
