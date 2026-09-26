import React from 'react';
import { X, Printer, Train, ShieldCheck, QrCode } from 'lucide-react';

export const BoardingPassModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const train = ticket.train_id || {};
  const passenger = ticket.passenger_id || {};

  const dep = train.departure_time ? new Date(train.departure_time) : new Date();
  const arr = train.arrival_time ? new Date(train.arrival_time) : new Date();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Train size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Official High-Speed Rail Pass</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="boarding-pass-ticket">
            {/* Header */}
            <div className="boarding-pass-header">
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                  RAILPASS EXPRESS
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  ELECTRONIC PASSENGER BOARDING PASS
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-chip status-${ticket.status}`}>
                  {ticket.status === 'Issued' && <ShieldCheck size={13} />}
                  {ticket.status}
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  PNR: {ticket.pnr}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="boarding-pass-grid">
              <div>
                <div className="boarding-field-label">Passenger Name</div>
                <div className="boarding-field-val">{passenger.name || 'Alex Morgan'}</div>
              </div>

              <div>
                <div className="boarding-field-label">Seat Assignment</div>
                <div className="boarding-field-val" style={{ color: 'var(--color-primary)' }}>
                  {ticket.seat_number}
                </div>
              </div>

              <div>
                <div className="boarding-field-label">Fare Paid</div>
                <div className="boarding-field-val">${ticket.fare || 45}.00</div>
              </div>

              <div>
                <div className="boarding-field-label">Train Service</div>
                <div className="boarding-field-val">{train.train_name || 'Apex Bullet'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {train.train_number}
                </div>
              </div>

              <div>
                <div className="boarding-field-label">Departure</div>
                <div className="boarding-field-val">{train.source || 'Origin'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {dep.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div>
                <div className="boarding-field-label">Destination</div>
                <div className="boarding-field-val">{train.destination || 'Destination'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div style={{ background: ticket.status === 'Issued' ? '#DCFCE7' : '#FEF3C7', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: ticket.status === 'Issued' ? '#166534' : '#B45309', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              {ticket.status === 'Issued' 
                ? 'Official Ticket Verified & Issued by Administrator. Ready for boarding.'
                : 'Ticket status is Reserved. Waiting for Administrator verification and issuance.'}
            </div>

            {/* Barcode & QR Code Row */}
            <div className="boarding-barcode-row">
              <div className="fake-barcode">
                |||| | |||||| || ||||| ||||||| |||
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                <QrCode size={36} color="var(--color-primary-dark)" />
                <span>SCAN AT PLATFORM GATE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print Boarding Pass
          </button>
        </div>
      </div>
    </div>
  );
};
