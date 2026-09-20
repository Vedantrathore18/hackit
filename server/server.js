import express from 'express';
import cors from 'cors';
import { readDb, writeDb, resetDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  const db = readDb();
  res.json({
    status: 'ok',
    service: 'MoneyView Financial Backend',
    port: PORT,
    timestamp: new Date().toISOString(),
    stats: {
      customers: db.customers.length,
      suppliers: db.suppliers.length,
      transactions: db.transactions.length,
      cashInHand: db.store.cashInHand
    }
  });
});

// 2. Bootstrap (All-in-one fast load)
app.get('/api/bootstrap', (req, res) => {
  const db = readDb();
  res.json({
    store: db.store,
    customers: db.customers,
    suppliers: db.suppliers,
    transactions: db.transactions
  });
});

// 3. Store Profile
app.get('/api/store', (req, res) => {
  const db = readDb();
  res.json(db.store);
});

app.put('/api/store', (req, res) => {
  const db = readDb();
  db.store = { ...db.store, ...req.body };
  writeDb(db);
  res.json(db.store);
});

// 4. Customers
app.get('/api/customers', (req, res) => {
  const db = readDb();
  res.json(db.customers);
});

app.post('/api/customers', (req, res) => {
  const db = readDb();
  const newCustomer = {
    id: req.body.id || `cust-${Date.now()}`,
    name: req.body.name || 'New Customer',
    phone: req.body.phone || '',
    balance: Number(req.body.balance) || 0,
    dueDays: Number(req.body.dueDays) || 7,
    dueDate: req.body.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    category: req.body.category || 'General',
    trustScore: Number(req.body.trustScore) || 85,
    behavior: req.body.behavior || 'Regular',
    status: req.body.status || 'pending',
    notes: req.body.notes || '',
    transactionsCount: req.body.transactionsCount || 1
  };

  db.customers.unshift(newCustomer);
  writeDb(db);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDb();
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  db.customers[index] = { ...db.customers[index], ...req.body };
  writeDb(db);
  res.json(db.customers[index]);
});

app.delete('/api/customers/:id', (req, res) => {
  const db = readDb();
  const filtered = db.customers.filter(c => c.id !== req.params.id);
  db.customers = filtered;
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// 5. Suppliers
app.get('/api/suppliers', (req, res) => {
  const db = readDb();
  res.json(db.suppliers);
});

app.post('/api/suppliers', (req, res) => {
  const db = readDb();
  const newSupplier = {
    id: req.body.id || `sup-${Date.now()}`,
    name: req.body.name || 'New Supplier',
    contact: req.body.contact || '',
    amountDue: Number(req.body.amountDue) || 0,
    dueDate: req.body.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    items: req.body.items || '',
    urgency: req.body.urgency || 'medium',
    bankName: req.body.bankName || 'General Bank'
  };

  db.suppliers.push(newSupplier);
  writeDb(db);
  res.status(201).json(newSupplier);
});

app.put('/api/suppliers/:id', (req, res) => {
  const db = readDb();
  const index = db.suppliers.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  db.suppliers[index] = { ...db.suppliers[index], ...req.body };
  writeDb(db);
  res.json(db.suppliers[index]);
});

app.delete('/api/suppliers/:id', (req, res) => {
  const db = readDb();
  db.suppliers = db.suppliers.filter(s => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// 6. Transactions
app.get('/api/transactions', (req, res) => {
  const db = readDb();
  res.json(db.transactions);
});

app.post('/api/transactions', (req, res) => {
  const db = readDb();
  const newTx = {
    id: req.body.id || `tx-${Date.now()}`,
    timestamp: req.body.timestamp || new Date().toISOString(),
    type: req.body.type || 'cash_sale',
    customerName: req.body.customerName || 'Walk-in Customer',
    amount: Number(req.body.amount) || 0,
    description: req.body.description || 'Transaction',
    channel: req.body.channel || 'Direct',
    status: req.body.status || 'recorded',
    customerId: req.body.customerId || null,
    supplierId: req.body.supplierId || null,
    paymentMode: req.body.paymentMode || 'cash'
  };

  db.transactions.unshift(newTx);
  writeDb(db);
  res.status(201).json(newTx);
});

app.delete('/api/transactions/:id', (req, res) => {
  const db = readDb();
  db.transactions = db.transactions.filter(t => t.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// 7. Bulk Sync / Save All (for full consistency sync)
app.post('/api/sync-all', (req, res) => {
  const db = readDb();
  const { store, customers, suppliers, transactions } = req.body;
  if (store) db.store = store;
  if (customers) db.customers = customers;
  if (suppliers) db.suppliers = suppliers;
  if (transactions) db.transactions = transactions;

  writeDb(db);
  res.json({ success: true, message: 'All entities synchronized to disk' });
});

// 8. Reset to Seed
app.post('/api/reset', (req, res) => {
  const freshData = resetDb();
  res.json({ success: true, data: freshData });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 MoneyView Backend Server running on port ${PORT}`);
  console.log(`🔗 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
