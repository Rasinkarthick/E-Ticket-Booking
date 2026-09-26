import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TrainCard } from '../components/TrainCard';
import { TicketCard } from '../components/TicketCard';
import { BookSeatModal } from '../components/BookSeatModal';
import { BoardingPassModal } from '../components/BoardingPassModal';
import { Search, Train, Ticket, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PassengerDashboard = () => {
  const { user } = useAuth();

  // Trains state
  const [trains, setTrains] = useState([]);
  const [loadingTrains, setLoadingTrains] = useState(true);
  const [searchSource, setSearchSource] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Tickets state
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [selectedTrainForBooking, setSelectedTrainForBooking] = useState(null);
  const [viewingPassTicket, setViewingPassTicket] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchTrains = async () => {
    setLoadingTrains(true);
    try {
      const params = {};
      if (searchSource) params.source = searchSource;
      if (searchDestination) params.destination = searchDestination;
      if (searchDate) params.date = searchDate;

      const res = await api.getTrains(params);
      if (res.success) {
        setTrains(res.trains || []);
      }
    } catch (err) {
      console.error('Error fetching trains:', err);
    } finally {
      setLoadingTrains(false);
    }
  };

  const fetchMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.getMyTickets();
      if (res.success) {
        setMyTickets(res.tickets || []);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTrains();
    fetchMyTickets();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrains();
  };

  const handleResetSearch = () => {
    setSearchSource('');
    setSearchDestination('');
    setSearchDate('');
    api.getTrains().then(res => {
      if (res.success) setTrains(res.trains || []);
    });
  };

  const handleBookingSuccess = (newTicket) => {
    setSelectedTrainForBooking(null);
    setNotification({
      type: 'success',
      text: `Seat ${newTicket.seat_number} reserved successfully! PNR: ${newTicket.pnr}`
    });
    fetchMyTickets();
    fetchTrains();
  };

  const handleCancelTicket = async (ticketId) => {
    try {
      const res = await api.cancelTicket({ ticket_id: ticketId });
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Ticket cancelled. Refund of $${res.cancellation?.refund_amount} initiated.`
        });
        fetchMyTickets();
        fetchTrains();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: 'Error cancelling ticket.'
      });
    }
  };

  // Filtered tickets
  const filteredTickets = statusFilter === 'All' 
    ? myTickets 
    : myTickets.filter(t => t.status === statusFilter);

  return (
    <div className="main-content">
      {/* Search Bar Hero Banner (Activity 2 & Use Case 3) */}
      <section className="search-hero">
        <div className="search-hero-content">
          <h1>Welcome aboard, {user?.name || 'Passenger'}</h1>
          <p>Search express routes, check real-time seat availability, and manage your travel passes.</p>

          <form onSubmit={handleSearchSubmit} className="search-bar-grid">
            <div className="search-input-field">
              <label>Origin Station</label>
              <input 
                type="text" 
                placeholder="e.g. New York, Boston..."
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
              />
            </div>

            <div className="search-input-field">
              <label>Destination Station</label>
              <input 
                type="text" 
                placeholder="e.g. Washington DC, Detroit..."
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
              />
            </div>

            <div className="search-input-field">
              <label>Departure Date</label>
              <input 
                type="date" 
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
                <Search size={16} />
                Search
              </button>
              {(searchSource || searchDestination || searchDate) && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ height: '42px' }}
                  onClick={handleResetSearch}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Global Notification Toast */}
      {notification && (
        <div 
          className={`alert-box ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} style={{ fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* My Booked Tickets Section (Derived from prompt) */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="section-header">
          <div>
            <h2>My Booked Tickets & Reservations</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              All your booked, issued, and cancelled tickets
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#E2E8F0', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            {['All', 'Reserved', 'Issued', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="btn btn-sm"
                style={{
                  background: statusFilter === status ? 'white' : 'transparent',
                  color: statusFilter === status ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: statusFilter === status ? 'var(--shadow-xs)' : 'none',
                  padding: '0.35rem 0.75rem'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loadingTickets ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Loading your tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
            <Ticket size={40} color="var(--color-text-light)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>No {statusFilter !== 'All' ? statusFilter : ''} Tickets Found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
              Select an available high-speed train below to reserve your seats.
            </p>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
              <TicketCard 
                key={ticket._id} 
                ticket={ticket} 
                onCancelTicket={handleCancelTicket}
                onViewPass={(t) => setViewingPassTicket(t)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Available Trains Section (Activity 2 & 3) */}
      <section>
        <div className="section-header">
          <div>
            <h2>Available Express & Bullet Trains</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Select a schedule to pick your specific coach seat
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchTrains}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {loadingTrains ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Fetching train schedules...
          </div>
        ) : trains.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
            <Train size={36} color="var(--color-text-light)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>No trains matched your search criteria.</p>
          </div>
        ) : (
          <div className="trains-grid">
            {trains.map((train) => (
              <TrainCard 
                key={train._id} 
                train={train} 
                onSelectTrain={(t) => setSelectedTrainForBooking(t)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Booking Seat Selection Modal */}
      {selectedTrainForBooking && (
        <BookSeatModal 
          train={selectedTrainForBooking} 
          onClose={() => setSelectedTrainForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Boarding Pass / E-Ticket Modal */}
      {viewingPassTicket && (
        <BoardingPassModal 
          ticket={viewingPassTicket} 
          onClose={() => setViewingPassTicket(null)}
        />
      )}
    </div>
  );
};
