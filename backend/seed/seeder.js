const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Train = require('../models/Train');
const Ticket = require('../models/Ticket');
const Cancellation = require('../models/Cancellation');

const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding initial database with sample trains, users, and reservations...');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const passengerPassword = await bcrypt.hash('pass123', salt);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@railway.gov',
      password: adminPassword,
      age: 38,
      gender: 'Other',
      address: 'Central Railway Control HQ, Station Square',
      role: 'Administrator'
    });

    const passenger1 = await User.create({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: passengerPassword,
      age: 28,
      gender: 'Male',
      address: '42 Hudson St, New York, NY',
      role: 'Passenger'
    });

    const passenger2 = await User.create({
      name: 'Sophia Chen',
      email: 'sophia@example.com',
      password: passengerPassword,
      age: 32,
      gender: 'Female',
      address: '104 Market Blvd, Boston, MA',
      role: 'Passenger'
    });

    // 2. Create Trains
    const now = new Date();
    
    // Train 1: Tomorrow 08:00 AM -> 11:30 AM
    const t1Dep = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    t1Dep.setHours(8, 0, 0, 0);
    const t1Arr = new Date(t1Dep.getTime() + 3.5 * 60 * 60 * 1000);

    const train1 = await Train.create({
      train_name: 'Apex Bullet Express',
      train_number: 'EXP-101',
      source: 'New York',
      destination: 'Washington DC',
      departure_time: t1Dep,
      arrival_time: t1Arr,
      total_seats: 50,
      available_seats: 48,
      fare: 65
    });

    // Train 2: Tomorrow 14:00 PM -> 19:30 PM
    const t2Dep = new Date(now.getTime() + 28 * 60 * 60 * 1000);
    t2Dep.setHours(14, 0, 0, 0);
    const t2Arr = new Date(t2Dep.getTime() + 5.5 * 60 * 60 * 1000);

    const train2 = await Train.create({
      train_name: 'Pacific Coastliner',
      train_number: 'PCL-404',
      source: 'San Francisco',
      destination: 'Los Angeles',
      departure_time: t2Dep,
      arrival_time: t2Arr,
      total_seats: 60,
      available_seats: 59,
      fare: 85
    });

    // Train 3: Day after tomorrow 09:30 AM -> 13:30 PM
    const t3Dep = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    t3Dep.setHours(9, 30, 0, 0);
    const t3Arr = new Date(t3Dep.getTime() + 4 * 60 * 60 * 1000);

    const train3 = await Train.create({
      train_name: 'Silver Arrow High-Speed',
      train_number: 'SAS-702',
      source: 'Chicago',
      destination: 'Detroit',
      departure_time: t3Dep,
      arrival_time: t3Arr,
      total_seats: 45,
      available_seats: 45,
      fare: 55
    });

    // Train 4: Boston to New York
    const t4Dep = new Date(now.getTime() + 30 * 60 * 60 * 1000);
    t4Dep.setHours(11, 0, 0, 0);
    const t4Arr = new Date(t4Dep.getTime() + 4 * 60 * 60 * 1000);

    const train4 = await Train.create({
      train_name: 'Atlantic Velocity',
      train_number: 'ATC-215',
      source: 'Boston',
      destination: 'New York',
      departure_time: t4Dep,
      arrival_time: t4Arr,
      total_seats: 55,
      available_seats: 55,
      fare: 50
    });

    // 3. Create Sample Tickets demonstrating the required states
    // Ticket 1: 'Reserved' status - Alex waiting for Admin to verify/issue
    const ticket1 = await Ticket.create({
      passenger_id: passenger1._id,
      train_id: train1._id,
      seat_number: 'A1-14',
      booking_date: new Date(Date.now() - 3600000 * 4),
      status: 'Reserved',
      pnr: 'PNR-APX920',
      fare: 65,
      is_verified: false
    });

    // Ticket 2: 'Issued' status - Alex's verified and issued ticket
    const ticket2 = await Ticket.create({
      passenger_id: passenger1._id,
      train_id: train1._id,
      seat_number: 'A1-15',
      booking_date: new Date(Date.now() - 3600000 * 8),
      status: 'Issued',
      pnr: 'PNR-EXP884',
      fare: 65,
      is_verified: true
    });

    // Ticket 3: 'Cancelled' status with Cancellation record
    const ticket3 = await Ticket.create({
      passenger_id: passenger2._id,
      train_id: train2._id,
      seat_number: 'B2-08',
      booking_date: new Date(Date.now() - 3600000 * 24),
      status: 'Cancelled',
      pnr: 'PNR-CAN101',
      fare: 85,
      is_verified: false
    });

    await Cancellation.create({
      ticket_id: ticket3._id,
      passenger_id: passenger2._id,
      cancellation_date: new Date(Date.now() - 3600000 * 12),
      refund_amount: 80.75,
      refund_status: 'Pending',
      reason: 'Schedule change requested by passenger'
    });

    console.log('[Seed] Database seeded successfully!');
    console.log('--- DEMO CREDENTIALS ---');
    console.log('Administrator: admin@railway.gov / admin123');
    console.log('Passenger:     alex@example.com / pass123');
    console.log('------------------------');
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
  }
};

module.exports = { seedDatabase };
