/**
 * Payment Comparison Script
 * Compares Juspay HDFC Dashboard CSV with Admin Portal Export CSV
 * to find missing/mismatched payments.
 *
 * Usage: node scripts/compare-payments.js
 *
 * Place the following files in your Downloads folder:
 * 1. Juspay CSV (HDFC dashboard export) - filename starting with "44207_tab_performance"
 * 2. Admin CSV (portal export) - filename starting with "payments_all"
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── CSV Parser (handles quoted fields with commas) ───
function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Find CSV files in Downloads ───
const downloadsDir = path.join(os.homedir(), 'Downloads');

function findFile(prefix) {
  const files = fs.readdirSync(downloadsDir);
  // Find most recent matching file
  const matches = files
    .filter(f => f.startsWith(prefix) && f.endsWith('.csv'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(downloadsDir, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);
  return matches.length > 0 ? path.join(downloadsDir, matches[0].name) : null;
}

const juspayFile = findFile('44207_tab_performance');
const adminFile = findFile('payments_all');

if (!juspayFile) {
  console.error('❌ Juspay CSV not found in Downloads! (looking for 44207_tab_performance*.csv)');
  process.exit(1);
}
if (!adminFile) {
  console.error('❌ Admin CSV not found in Downloads! (looking for payments_all*.csv)');
  process.exit(1);
}

console.log('📁 Juspay CSV:', path.basename(juspayFile));
console.log('📁 Admin CSV:', path.basename(adminFile));
console.log('');

// ─── Parse both CSVs ───
const juspayData = parseCSV(fs.readFileSync(juspayFile, 'utf-8'));
const adminData = parseCSV(fs.readFileSync(adminFile, 'utf-8'));

// ─── Build lookup maps ───

// Juspay: Group by order_id, track all txn attempts and final status
// For each unique order_id, find the last transaction attempt's status
const juspayByOrder = {};
for (const row of juspayData) {
  const orderId = row.order_id;
  if (!juspayByOrder[orderId]) {
    juspayByOrder[orderId] = [];
  }
  juspayByOrder[orderId].push(row);
}

// Determine final Juspay status for each order (SUCCESS if any attempt was SUCCESS)
const juspayFinalStatus = {};
for (const [orderId, attempts] of Object.entries(juspayByOrder)) {
  const hasSuccess = attempts.some(a => a.payment_status === 'SUCCESS');
  juspayFinalStatus[orderId] = {
    status: hasSuccess ? 'SUCCESS' : 'FAILURE',
    amount: parseFloat(attempts[0].amount),
    attempts: attempts.length,
    successTxn: attempts.find(a => a.payment_status === 'SUCCESS'),
    allAttempts: attempts,
    customerId: attempts[0].customer_id,
    platform: attempts[0].platform,
  };
}

// Admin: Map by Juspay ID (which is the order_id from Juspay)
const adminByJuspayId = {};
const adminByOrderId = {}; // by admin's internal Order ID
for (const row of adminData) {
  const juspayId = row['Juspay ID'];
  if (juspayId) {
    adminByJuspayId[juspayId] = row;
  }
  adminByOrderId[row['Order ID']] = row;
}

// ═══════════════════════════════════════════════════════════
// SECTION 1: Find SUCCESS payments in Juspay that are NOT
//            showing as "success" in Admin portal
// ═══════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════');
console.log('  SECTION 1: MISSING / MISMATCHED PAYMENTS');
console.log('  (Juspay = SUCCESS but Admin ≠ success)');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const missingPayments = [];
const mismatchedPayments = [];

for (const [orderId, info] of Object.entries(juspayFinalStatus)) {
  if (info.status !== 'SUCCESS') continue; // Only care about successful Juspay payments

  const adminRow = adminByJuspayId[orderId];

  if (!adminRow) {
    // Order exists in Juspay but NOT in admin portal at all
    missingPayments.push({ orderId, ...info });
  } else {
    const adminGatewayStatus = adminRow['Gateway Status'];
    const adminStatus = adminRow['Status'];

    if (adminGatewayStatus !== 'success') {
      mismatchedPayments.push({
        orderId,
        juspayInfo: info,
        adminRow,
      });
    }
  }
}

console.log(`🔍 Total unique orders in Juspay CSV: ${Object.keys(juspayByOrder).length}`);
console.log(`🔍 Total successful orders in Juspay: ${Object.values(juspayFinalStatus).filter(v => v.status === 'SUCCESS').length}`);
console.log(`🔍 Total rows in Admin CSV: ${adminData.length}`);
console.log(`🔍 Admin rows with gateway_status=success: ${adminData.filter(r => r['Gateway Status'] === 'success').length}`);
console.log('');

if (missingPayments.length > 0) {
  console.log(`⚠️  ${missingPayments.length} Juspay SUCCESS payment(s) NOT FOUND in Admin portal:`);
  console.log('─'.repeat(80));
  for (const mp of missingPayments) {
    console.log(`  Order ID: ${mp.orderId}`);
    console.log(`  Amount: ₹${mp.amount}`);
    console.log(`  Customer ID: ${mp.customerId}`);
    console.log(`  Platform: ${mp.platform}`);
    if (mp.successTxn) {
      console.log(`  Juspay Txn ID: ${mp.successTxn.juspay_txn_id}`);
      console.log(`  Txn UUID: ${mp.successTxn.txn_uuid}`);
    }
    console.log('─'.repeat(80));
  }
  console.log('');
}

if (mismatchedPayments.length > 0) {
  console.log(`⚠️  ${mismatchedPayments.length} payment(s) SUCCESS in Juspay but NOT success in Admin:`);
  console.log('─'.repeat(80));
  for (const mm of mismatchedPayments) {
    const a = mm.adminRow;
    console.log(`  Order ID: ${mm.orderId}`);
    console.log(`  Admin Booking #: ${a['Order ID']}`);
    console.log(`  User: ${a['User']}`);
    console.log(`  Email: ${a['Email']}`);
    console.log(`  Phone: ${a['Phone']}`);
    console.log(`  Event: ${a['Event']}`);
    console.log(`  Amount: ₹${a['Amount']} (Juspay: ₹${mm.juspayInfo.amount})`);
    console.log(`  Admin Status: ${a['Status']} | Gateway: ${a['Gateway Status']}`);
    console.log(`  Juspay Status: SUCCESS`);
    console.log(`  Booking Date: ${a['Date']}`);
    if (mm.juspayInfo.successTxn) {
      console.log(`  Juspay Txn ID: ${mm.juspayInfo.successTxn.juspay_txn_id}`);
      console.log(`  Txn UUID: ${mm.juspayInfo.successTxn.txn_uuid}`);
    }
    console.log(`  ⚡ ACTION NEEDED: Payment received but booking not confirmed!`);
    console.log('─'.repeat(80));
  }
  console.log('');
}

if (missingPayments.length === 0 && mismatchedPayments.length === 0) {
  console.log('✅ No missing or mismatched payments found!');
  console.log('');
}

// ═══════════════════════════════════════════════════════════
// SECTION 2: Details for the 2 specific Image Order IDs
// ═══════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════');
console.log('  SECTION 2: IMAGE ORDER ID DETAILS');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const imageOrderIds = [
  'CIT-1774452223765-24F89F26',  // Image 1: 44207-CIT-1774452223765-24F89F26-1
  'CIT-1774552664401-8C339AC7',  // Image 2: 44207-CIT-1774552664401-8C339AC7-1
];

for (const orderId of imageOrderIds) {
  console.log(`📋 Order: ${orderId}`);
  console.log('─'.repeat(70));

  // Juspay data
  const juspayEntries = juspayByOrder[orderId];
  if (juspayEntries) {
    console.log('  [JUSPAY HDFC Dashboard]');
    for (const entry of juspayEntries) {
      console.log(`    Txn ID: ${entry.juspay_txn_id}`);
      console.log(`    Amount: ₹${entry.amount}`);
      console.log(`    Status: ${entry.payment_status}`);
      console.log(`    Platform: ${entry.platform}`);
      console.log(`    Customer: ${entry.customer_id}`);
      console.log(`    Txn UUID: ${entry.txn_uuid}`);
      console.log(`    Error: ${entry.error_code || 'None'}`);
      console.log('');
    }
  } else {
    console.log('  [JUSPAY] ❌ Not found in Juspay CSV');
  }

  // Admin data
  const adminRow = adminByJuspayId[orderId];
  if (adminRow) {
    console.log('  [ADMIN Portal]');
    console.log(`    Booking #: ${adminRow['Order ID']}`);
    console.log(`    User: ${adminRow['User']}`);
    console.log(`    Email: ${adminRow['Email']}`);
    console.log(`    Phone: ${adminRow['Phone']}`);
    console.log(`    Event: ${adminRow['Event']}`);
    console.log(`    Amount: ₹${adminRow['Amount']}`);
    console.log(`    Qty: ${adminRow['Qty']}`);
    console.log(`    Status: ${adminRow['Status']}`);
    console.log(`    Gateway Status: ${adminRow['Gateway Status']}`);
    console.log(`    Transaction ID: ${adminRow['Transaction ID'] || 'NONE'}`);
    console.log(`    Date: ${adminRow['Date']}`);
  } else {
    console.log('  [ADMIN] ❌ Not found in Admin CSV');
  }

  // Mismatch check
  if (juspayEntries && adminRow) {
    const juspayHasSuccess = juspayEntries.some(e => e.payment_status === 'SUCCESS');
    const adminIsSuccess = adminRow['Gateway Status'] === 'success';
    if (juspayHasSuccess && !adminIsSuccess) {
      console.log('');
      console.log('  🚨 MISMATCH: Juspay shows SUCCESS but Admin shows ' +
        `${adminRow['Status']}/${adminRow['Gateway Status']}`);
      console.log('  ⚡ This payment was COLLECTED but booking is NOT confirmed!');
    } else if (juspayHasSuccess && adminIsSuccess) {
      console.log('');
      console.log('  ✅ MATCH: Both Juspay and Admin show successful payment');
    }
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('');
}

// ═══════════════════════════════════════════════════════════
// SECTION 3: Summary Statistics
// ═══════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════');
console.log('  SECTION 3: SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const juspaySuccessCount = Object.values(juspayFinalStatus).filter(v => v.status === 'SUCCESS').length;
const juspayFailCount = Object.values(juspayFinalStatus).filter(v => v.status === 'FAILURE').length;
const juspaySuccessAmount = Object.values(juspayFinalStatus)
  .filter(v => v.status === 'SUCCESS')
  .reduce((sum, v) => sum + v.amount, 0);

const adminSuccessCount = adminData.filter(r => r['Gateway Status'] === 'success').length;
const adminSuccessAmount = adminData
  .filter(r => r['Gateway Status'] === 'success')
  .reduce((sum, r) => sum + parseFloat(r['Amount'] || 0), 0);

console.log('Juspay HDFC Dashboard:');
console.log(`  Total unique orders: ${Object.keys(juspayByOrder).length}`);
console.log(`  Successful: ${juspaySuccessCount} (₹${juspaySuccessAmount.toFixed(2)})`);
console.log(`  Failed: ${juspayFailCount}`);
console.log('');
console.log('Admin Portal:');
console.log(`  Total bookings: ${adminData.length}`);
console.log(`  Gateway Success: ${adminSuccessCount} (₹${adminSuccessAmount.toFixed(2)})`);
console.log(`  Confirmed: ${adminData.filter(r => r['Status'] === 'confirmed').length}`);
console.log(`  Pending: ${adminData.filter(r => r['Status'] === 'pending').length}`);
console.log(`  Cancelled: ${adminData.filter(r => r['Status'] === 'cancelled').length}`);
console.log('');
console.log(`📊 Difference: ${juspaySuccessCount - adminSuccessCount} payment(s) SUCCESS in Juspay but not in Admin`);
console.log(`💰 Revenue difference: ₹${(juspaySuccessAmount - adminSuccessAmount).toFixed(2)}`);
console.log('');

// ═══════════════════════════════════════════════════════════
// SECTION 4: SQL Queries for DB investigation
// ═══════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════');
console.log('  SECTION 4: SQL QUERIES FOR DB FIX');
console.log('  (Run these against your PostgreSQL database)');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Generate SQL for each mismatched payment
const allProblematic = [...mismatchedPayments];
if (allProblematic.length > 0) {
  console.log('-- Query to check the problematic bookings:');
  const problemOrderIds = allProblematic.map(p => `'${p.orderId}'`).join(', ');
  console.log(`SELECT b.id, b.status, b.juspay_order_id, b.total_amount, b.created_at,`);
  console.log(`       p.status as payment_status, p.gateway_status, p.transaction_id, p.paid_at,`);
  console.log(`       u.name, u.email, u.phone,`);
  console.log(`       e.title as event_name`);
  console.log(`FROM bookings b`);
  console.log(`LEFT JOIN payments p ON p.booking_id = b.id`);
  console.log(`LEFT JOIN users u ON u.id = b.user_id`);
  console.log(`LEFT JOIN booking_items bi ON bi.booking_id = b.id`);
  console.log(`LEFT JOIN events e ON e.id = bi.event_id`);
  console.log(`WHERE b.juspay_order_id IN (${problemOrderIds});`);
  console.log('');

  console.log('-- Fix queries (UPDATE status for confirmed payments):');
  console.log('-- ⚠️  VERIFY EACH ONE BEFORE RUNNING! Check Juspay dashboard first.');
  console.log('');
  for (const mm of allProblematic) {
    const a = mm.adminRow;
    const successTxn = mm.juspayInfo.successTxn;
    console.log(`-- Fix: ${a['User']} - ${a['Event']} - ₹${a['Amount']}`);
    console.log(`-- Juspay Txn: ${successTxn ? successTxn.juspay_txn_id : 'N/A'}`);
    console.log(`UPDATE bookings SET status = 'confirmed' WHERE juspay_order_id = '${mm.orderId}';`);
    if (successTxn) {
      console.log(`UPDATE payments SET status = 'completed', gateway_status = 'success',`);
      console.log(`  transaction_id = '${successTxn.juspay_txn_id}',`);
      console.log(`  paid_at = NOW()`);
      console.log(`  WHERE booking_id = (SELECT id FROM bookings WHERE juspay_order_id = '${mm.orderId}');`);
    }
    console.log('');
  }
}

// Image order queries
console.log('-- Query for the 2 specific Image Order IDs:');
for (const orderId of imageOrderIds) {
  console.log(`SELECT b.id, b.status, b.juspay_order_id, b.total_amount,`);
  console.log(`       p.status as pay_status, p.gateway_status, p.transaction_id,`);
  console.log(`       p.sdk_payload::text as sdk_payload_text,`);
  console.log(`       u.name, u.email, u.phone, e.title as event`);
  console.log(`FROM bookings b`);
  console.log(`LEFT JOIN payments p ON p.booking_id = b.id`);
  console.log(`LEFT JOIN users u ON u.id = b.user_id`);
  console.log(`LEFT JOIN booking_items bi ON bi.booking_id = b.id`);
  console.log(`LEFT JOIN events e ON e.id = bi.event_id`);
  console.log(`WHERE b.juspay_order_id = '${orderId}';`);
  console.log('');
}
