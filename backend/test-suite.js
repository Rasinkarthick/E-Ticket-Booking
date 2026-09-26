// Comprehensive End-to-End System Verification Test
const API = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting E-Ticket Booking System End-to-End Verification...\n');

  // 1. Passenger Login
  console.log('1. Testing POST /api/auth/login (Passenger)...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@example.com', password: 'pass123' })
  }).then(r => r.json());
  if (!loginRes.success) throw new Error('Passenger login failed: ' + loginRes.message);
  console.log('✅ Passenger logged in successfully:', loginRes.user.name, `(${loginRes.user.role})`);
  const passengerToken = loginRes.token;

  // 2. Train Search
  console.log('\n2. Testing GET /api/trains?source=New York&destination=Washington DC (Activity 2)...');
  const trainsRes = await fetch(`${API}/trains?source=New York&destination=Washington DC`).then(r => r.json());
  if (!trainsRes.success || trainsRes.trains.length === 0) throw new Error('Train search failed');
  const train = trainsRes.trains[0];
  console.log(`✅ Found train: ${train.train_name} (${train.train_number}) with ${train.available_seats} available seats.`);

  // 3. Seat Availability Check
  console.log(`\n3. Testing GET /api/trains/${train._id}/availability (Activity 3: logical check on available seats)...`);
  const availRes = await fetch(`${API}/trains/${train._id}/availability`).then(r => r.json());
  if (!availRes.success) throw new Error('Availability check failed');
  console.log(`✅ Available seats: ${availRes.available_seats}/${availRes.total_seats}. Booked seats: [${availRes.booked_seat_numbers.join(', ')}]`);

  // 4. Passenger Book Ticket
  console.log('\n4. Testing POST /api/passenger/book (Activity 4, Sequence 5-11)...');
  const newSeatNumber = 'A1-21';
  const bookRes = await fetch(`${API}/passenger/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${passengerToken}`
    },
    body: JSON.stringify({
      train_id: train._id,
      seat_number: newSeatNumber,
      fare: train.fare
    })
  }).then(r => r.json());
  if (!bookRes.success) throw new Error('Booking failed: ' + bookRes.message);
  console.log(`✅ Ticket reserved! PNR: ${bookRes.ticket.pnr}, Status: ${bookRes.ticket.status}, Seat: ${bookRes.ticket.seat_number}`);
  const testTicketId = bookRes.ticket._id;

  // 5. Admin Login
  console.log('\n5. Testing POST /api/auth/login (Administrator)...');
  const adminLoginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@railway.gov', password: 'admin123' })
  }).then(r => r.json());
  if (!adminLoginRes.success) throw new Error('Admin login failed');
  console.log('✅ Administrator logged in:', adminLoginRes.user.name, `(${adminLoginRes.user.role})`);
  const adminToken = adminLoginRes.token;

  // 6. Admin Get All Tickets
  console.log('\n6. Testing GET /api/admin/tickets (Use Case: verify update logic)...');
  const adminTicketsRes = await fetch(`${API}/admin/tickets`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());
  if (!adminTicketsRes.success) throw new Error('Admin tickets fetch failed');
  console.log(`✅ Admin retrieved ${adminTicketsRes.count} tickets from database.`);

  // 7. Admin Verify Ticket
  console.log(`\n7. Testing PUT /api/admin/tickets/${testTicketId}/verify (Explicit Verification Use Case)...`);
  const verifyRes = await fetch(`${API}/admin/tickets/${testTicketId}/verify`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());
  if (!verifyRes.success) throw new Error('Ticket verification failed');
  console.log(`✅ Ticket verified by admin: is_verified=${verifyRes.ticket.is_verified}, status=${verifyRes.ticket.status}`);

  // 8. Admin Issue Ticket (Collaboration flow step 12)
  console.log(`\n8. Testing POST /api/admin/issue (Collaboration flow step 12: Admin changes ticket status to 'Issued')...`);
  const issueRes = await fetch(`${API}/admin/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ ticket_id: testTicketId })
  }).then(r => r.json());
  if (!issueRes.success) throw new Error('Ticket issuance failed: ' + issueRes.message);
  console.log(`✅ Ticket officially issued! PNR: ${issueRes.ticket.pnr}, New Status: '${issueRes.ticket.status}'`);

  // 9. Passenger Cancel Ticket
  console.log('\n9. Testing POST /api/passenger/cancel (Collaboration diagram logic: creates Cancellation record, updates Ticket status)...');
  const cancelRes = await fetch(`${API}/passenger/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${passengerToken}`
    },
    body: JSON.stringify({
      ticket_id: testTicketId,
      reason: 'Passenger travel plans modified'
    })
  }).then(r => r.json());
  if (!cancelRes.success) throw new Error('Cancellation failed: ' + cancelRes.message);
  console.log(`✅ Ticket cancelled! Status: '${cancelRes.ticket.status}', Refund Amount: $${cancelRes.cancellation.refund_amount}, Refund Status: '${cancelRes.cancellation.refund_status}'`);

  // 10. Admin Add New Train
  console.log('\n10. Testing POST /api/admin/trains (Use Case: update train database/manage train inventory)...');
  const now = new Date();
  const depTime = new Date(now.getTime() + 72 * 3600 * 1000);
  const arrTime = new Date(depTime.getTime() + 3 * 3600 * 1000);
  const addTrainRes = await fetch(`${API}/admin/trains`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      train_name: 'Metro Velocity Superliner',
      train_number: 'MVS-990',
      source: 'Philadelphia',
      destination: 'Washington DC',
      departure_time: depTime,
      arrival_time: arrTime,
      total_seats: 80,
      fare: 55
    })
  }).then(r => r.json());
  if (!addTrainRes.success) throw new Error('Add train failed: ' + addTrainRes.message);
  console.log(`✅ New train added to inventory! ${addTrainRes.train.train_name} (${addTrainRes.train.train_number})`);

  console.log('\n🎉 ALL 10 CORE SPECIFICATIONS VERIFIED AND WORKING PERFECTLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
