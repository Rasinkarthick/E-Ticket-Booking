import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Train, Ticket, Users, ShieldCheck, CheckCircle2, AlertCircle, 
  Plus, Trash2, Edit3, RefreshCw, Clock, DollarSign, ArrowUpRight 
} from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'trains' | 'users' | 'cancellations'
  
  // Data states
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [trains, setTrains] = useState([]);
  const [users, setUsers] = useState([]);
  const [cancellations, setCancellations] = useState([]);
  
  // Filter & Loading
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Train creation modal
  const [showAddTrainModal, setShowAddTrainModal] = useState(false);
  const [newTrain, setNewTrain] = useState({
    train_name: '',
    train_number: '',
    source: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    total_seats: 60,
    fare: 50
  });

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ticketsRes, trainsRes, usersRes, cancelsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllTickets(ticketStatusFilter),
        api.getTrains(),
        api.getUsers(),
        api.getCancellations()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
      if (trainsRes.success) setTrains(trainsRes.trains);
      if (usersRes.success) setUsers(usersRes.users);
      if (cancelsRes.success) setCancellations(cancelsRes.cancellations);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [ticketStatusFilter]);

  // Action: Verify Ticket
  const handleVerifyTicket = async (ticketId) => {
    try {
      const res = await api.verifyTicket(ticketId);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        loadAllAdminData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to verify ticket.' });
    }
  };

  // Action: Issue Ticket (Explicit Step 12 from Collaboration diagram)
  const handleIssueTicket = async (ticketId) => {
    try {
      const res = await api.issueTicket(ticketId);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        loadAllAdminData();
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to issue ticket.' });
    }
  };

  // Action: Create Train
  const handleCreateTrainSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createTrain(newTrain);
      if (res.success) {
        setToast({ type: 'success', message: 'Train added to database successfully!' });
        setShowAddTrainModal(false);
        setNewTrain({
          train_name: '',
          train_number: '',
          source: '',
          destination: '',
          departure_time: '',
          arrival_time: '',
          total_seats: 60,
          fare: 50
        });
        loadAllAdminData();
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Error adding train.' });
    }
  };

  // Action: Delete Train
  const handleDeleteTrain = async (trainId, trainName) => {
    if (!window.confirm(`Are you sure you want to delete train "${trainName}"?`)) return;
    try {
      const res = await api.deleteTrain(trainId);
      if (res.success) {
        setToast({ type: 'success', message: 'Train deleted from system.' });
        loadAllAdminData();
      } else {
        setToast({ type: 'error', message: res.message });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Error deleting train.' });
    }
  };

  // Action: Process Refund
  const handleProcessRefund = async (cancellationId) => {
    try {
      const res = await api.processRefund(cancellationId);
      if (res.success) {
        setToast({ type: 'success', message: 'Refund marked as Processed.' });
        loadAllAdminData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Error processing refund.' });
    }
  };

  return (
    <div className="main-content">
      {/* Header Row */}
      <div className="admin-header-row">
        <div>
          <h2>Railway Dispatch & Administration Console</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            System control panel for fleet inventory, ticket verification, issuance, and passenger management.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadAllAdminData}>
          <RefreshCw size={14} />
          Sync Data
        </button>
      </div>

      {/* Global Toast */}
      {toast && (
        <div 
          className={`alert-box ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} style={{ fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* KPI Widgets (image_6.png style) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Active Train Fleet</div>
            <div className="kpi-value">{stats?.totalTrains ?? trains.length}</div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Train size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Pending Verification</div>
            <div className="kpi-value" style={{ color: '#D97706' }}>
              {stats?.reservedCount ?? 0}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Issued Rail Passes</div>
            <div className="kpi-value" style={{ color: '#16A34A' }}>
              {stats?.issuedCount ?? 0}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Registered Accounts</div>
            <div className="kpi-value">{stats?.totalUsers ?? users.length}</div>
          </div>
          <div className="kpi-icon-box" style={{ background: '#F1F5F9', color: '#475569' }}>
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Admin Tabbed Navigation */}
      <div className="admin-tab-nav">
        <button 
          className={`admin-tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <Ticket size={16} />
          Ticket Management (Verify / Issue)
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'trains' ? 'active' : ''}`}
          onClick={() => setActiveTab('trains')}
        >
          <Train size={16} />
          Train Fleet & Schedule
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          User Registry
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'cancellations' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancellations')}
        >
          <AlertCircle size={16} />
          Cancellations & Refunds ({cancellations.length})
        </button>
      </div>

      {/* TAB 1: TICKET MANAGEMENT (VERIFY / ISSUE) */}
      {activeTab === 'tickets' && (
        <div className="table-card">
          <div className="table-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Ticket Reservation & Issuance Ledger</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                ({tickets.length} total)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Filter:</span>
              <select 
                className="input-box" 
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Reserved">Reserved (Pending Admin)</option>
                <option value="Booked">Booked / Verified</option>
                <option value="Issued">Issued (Active Pass)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PNR Code</th>
                  <th>Passenger</th>
                  <th>Train Service</th>
                  <th>Seat</th>
                  <th>Status</th>
                  <th>Fare</th>
                  <th style={{ textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className="pnr-tag">{t.pnr}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.passenger_id?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {t.passenger_id?.email || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.train_id?.train_name || 'Train'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {t.train_id?.source} ➔ {t.train_id?.destination}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {t.seat_number}
                      </span>
                    </td>
                    <td>
                      <span className={`status-chip status-${t.status}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>${t.fare || 45}.00</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {/* Step 1: Admin Verify Use Case */}
                        {!t.is_verified && t.status !== 'Cancelled' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            title="Verify Passenger Identity & Ticket Details"
                            onClick={() => handleVerifyTicket(t._id)}
                          >
                            <ShieldCheck size={14} />
                            Verify
                          </button>
                        )}

                        {/* Step 12: Admin Issue Ticket Action */}
                        {t.status !== 'Issued' && t.status !== 'Cancelled' && (
                          <button 
                            className="btn btn-success btn-sm"
                            title="Issue Official Boarding Pass (Collaboration Flow Step 12)"
                            onClick={() => handleIssueTicket(t._id)}
                          >
                            <CheckCircle2 size={14} />
                            Issue Ticket
                          </button>
                        )}

                        {t.status === 'Issued' && (
                          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <ShieldCheck size={14} /> Issued
                          </span>
                        )}

                        {t.status === 'Cancelled' && (
                          <span style={{ fontSize: '0.78rem', color: '#9F1239', fontWeight: 600 }}>
                            Void
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TRAIN INVENTORY */}
      {activeTab === 'trains' && (
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Fleet & Schedule Inventory</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Add new trains, update seating capacity, and maintain high-speed routes
              </p>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddTrainModal(true)}
            >
              <Plus size={16} />
              Add High-Speed Train
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Train Name & No</th>
                  <th>Route</th>
                  <th>Departure / Arrival</th>
                  <th>Capacity</th>
                  <th>Available</th>
                  <th>Fare</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trains.map((train) => (
                  <tr key={train._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{train.train_name}</div>
                      <span className="pnr-tag" style={{ fontSize: '0.72rem' }}>{train.train_number}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{train.source} ➔ {train.destination}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {new Date(train.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(train.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {new Date(train.departure_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td>{train.total_seats} seats</td>
                    <td>
                      <span style={{ fontWeight: 700, color: train.available_seats > 5 ? '#166534' : '#DC2626' }}>
                        {train.available_seats} left
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>${train.fare || 45}.00</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => handleDeleteTrain(train._id, train.train_name)}
                        title="Delete Train"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER REGISTRY */}
      {activeTab === 'users' && (
        <div className="table-card">
          <div className="table-toolbar">
            <h3 style={{ fontSize: '1.1rem' }}>Registered Users & Authorities</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Total: {users.length} accounts
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Age / Gender</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`status-chip ${u.role === 'Administrator' ? 'status-Booked' : 'status-Reserved'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.age ? `${u.age} yrs` : '—'} • {u.gender || '—'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {u.address || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CANCELLATIONS & REFUNDS */}
      {activeTab === 'cancellations' && (
        <div className="table-card">
          <div className="table-toolbar">
            <h3 style={{ fontSize: '1.1rem' }}>Passenger Cancellation Records & Refund Ledger</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket / PNR</th>
                  <th>Passenger</th>
                  <th>Cancellation Date</th>
                  <th>Refund Amount</th>
                  <th>Refund Status</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cancellations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      No cancellation records logged yet.
                    </td>
                  </tr>
                ) : (
                  cancellations.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <span className="pnr-tag">{c.ticket_id?.pnr || 'PNR'}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.passenger_id?.name || 'Passenger'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {c.passenger_id?.email}
                        </div>
                      </td>
                      <td>
                        {new Date(c.cancellation_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <strong style={{ color: '#166534' }}>${c.refund_amount?.toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`status-chip ${c.refund_status === 'Processed' ? 'status-Issued' : 'status-Reserved'}`}>
                          {c.refund_status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {c.reason}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {c.refund_status === 'Pending' ? (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleProcessRefund(c._id)}
                          >
                            Process Refund
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                            Refund Complete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Train Modal */}
      {showAddTrainModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>Add New High-Speed Train Route</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddTrainModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateTrainSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Train Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HyperRail Express"
                    className="input-box"
                    value={newTrain.train_name}
                    onChange={(e) => setNewTrain({ ...newTrain, train_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Train Number / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. EXP-505"
                    className="input-box"
                    value={newTrain.train_number}
                    onChange={(e) => setNewTrain({ ...newTrain, train_number: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Source Station</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New York"
                      className="input-box"
                      value={newTrain.source}
                      onChange={(e) => setNewTrain({ ...newTrain, source: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Station</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Washington DC"
                      className="input-box"
                      value={newTrain.destination}
                      onChange={(e) => setNewTrain({ ...newTrain, destination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Departure Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="input-box"
                      value={newTrain.departure_time}
                      onChange={(e) => setNewTrain({ ...newTrain, departure_time: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Arrival Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="input-box"
                      value={newTrain.arrival_time}
                      onChange={(e) => setNewTrain({ ...newTrain, arrival_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Seats</label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="500"
                      className="input-box"
                      value={newTrain.total_seats}
                      onChange={(e) => setNewTrain({ ...newTrain, total_seats: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ticket Fare ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-box"
                      value={newTrain.fare}
                      onChange={(e) => setNewTrain({ ...newTrain, fare: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTrainModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Train Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
