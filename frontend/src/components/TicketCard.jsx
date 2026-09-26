import React, { useState } from 'react';
import { Train, Calendar, Clock, MapPin, ShieldCheck, XCircle, FileText } from 'lucide-react';

export const TicketCard = ({ ticket, onCancelTicket, onViewPass }) => {
  const [cancelling, setCancelling] = useState(false);
  const train = ticket.train_id || {};
  const dep = train.departure_time ? new Date(train.departure_time) : new Date();

  const handleCancelClick = async () => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel ticket ${ticket.pnr}? An automatic refund of ~$${(ticket.fare * 0.85).toFixed(2)} will be initiated.`
    );
    if (!confirmCancel) return;

    setCancelling(true);
    await onCancelTicket(ticket._id);
    setCancelling(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Issued': return '#10B981';
      case 'Reserved': return '#F59E0B';
      case 'Booked': return '#6366F1';
      case 'Cancelled': return '#EF4444';
      default: return '#64748B';
    }
  };

  return (
    <div className="ticket-card">
      <div 
        className="ticket-status-bar" 
        style={{ backgroundColor: getStatusColor(ticket.status) }} 
      />

      <div className="ticket-card-body">
        {/* PNR and Status */}
        <div className="ticket-pnr-row">
          <span className="pnr-tag">{ticket.pnr}</span>
          <span className={`status-chip status-${ticket.status}`}>
            {ticket.status === 'Issued' && <ShieldCheck size={12} />}
            {ticket.status === 'Cancelled' && <XCircle size={12} />}
            {ticket.status}
          </span>
        </div>

        {/* Train Details */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
            {train.train_name || 'Express Service'}
          </h4>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            {train.source || 'Origin'} ➔ {train.destination || 'Destination'}
          </div>
        </div>

        {/* Metadata info */}
        <div className="ticket-seat-meta">
          <div>
            <strong>Seat No</strong>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{ticket.seat_number}</span>
          </div>
          <div>
            <strong>Departure</strong>
            <span>{dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div>
            <strong>Date</strong>
            <span>{dep.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div>
            <strong>Fare</strong>
            <span>${ticket.fare || 45}.00</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="ticket-actions-bar">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onViewPass(ticket)}
            title="View Electronic Boarding Pass"
          >
            <FileText size={14} />
            Boarding Pass
          </button>

          {ticket.status !== 'Cancelled' && (
            <button 
              className="btn btn-danger-outline btn-sm"
              disabled={cancelling}
              onClick={handleCancelClick}
              title="Request cancellation and refund"
            >
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
