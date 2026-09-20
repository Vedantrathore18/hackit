// MoneyView API Client - Connects to Express REST Backend with resilient offline fallback

const API_BASE = '/api';

// Safe fetch wrapper with timeout
const safeFetch = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) {
      throw new Error(`API error HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// 1. Healthcheck
export const checkBackendHealth = async () => {
  try {
    const data = await safeFetch(`${API_BASE}/health`, {}, 2500);
    return { online: true, data };
  } catch (err) {
    return { online: false, error: err.message };
  }
};

// 2. Bootstrap (Load all data from backend, fallback to localStorage/seed)
export const fetchBootstrapData = async (fallbackData = {}) => {
  try {
    const data = await safeFetch(`${API_BASE}/bootstrap`, {}, 3500);
    if (data && data.store && data.customers) {
      // Cache in localStorage for resilience
      try {
        localStorage.setItem('moneyview_store', JSON.stringify(data.store));
        localStorage.setItem('moneyview_customers', JSON.stringify(data.customers));
        localStorage.setItem('moneyview_suppliers', JSON.stringify(data.suppliers));
        localStorage.setItem('moneyview_transactions', JSON.stringify(data.transactions));
      } catch (e) {
        console.warn('LocalStorage caching skipped:', e);
      }
      return {
        online: true,
        store: data.store,
        customers: data.customers,
        suppliers: data.suppliers,
        transactions: data.transactions
      };
    }
    throw new Error('Incomplete data received from server');
  } catch (err) {
    console.warn('[MoneyView API] Backend offline, falling back to local cache:', err.message);
    return {
      online: false,
      store: fallbackData.store,
      customers: fallbackData.customers,
      suppliers: fallbackData.suppliers,
      transactions: fallbackData.transactions
    };
  }
};

// 3. Transactions
export const apiCreateTransaction = async (tx) => {
  try {
    return await safeFetch(`${API_BASE}/transactions`, {
      method: 'POST',
      body: JSON.stringify(tx)
    });
  } catch (err) {
    console.warn('[API] Save transaction offline:', err.message);
    return tx;
  }
};

// 4. Customers
export const apiCreateCustomer = async (customer) => {
  try {
    return await safeFetch(`${API_BASE}/customers`, {
      method: 'POST',
      body: JSON.stringify(customer)
    });
  } catch (err) {
    console.warn('[API] Save customer offline:', err.message);
    return customer;
  }
};

export const apiUpdateCustomer = async (id, data) => {
  try {
    return await safeFetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('[API] Update customer offline:', err.message);
    return data;
  }
};

export const apiDeleteCustomer = async (id) => {
  try {
    return await safeFetch(`${API_BASE}/customers/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('[API] Delete customer offline:', err.message);
    return { success: false };
  }
};

// 5. Suppliers
export const apiUpdateSupplier = async (id, data) => {
  try {
    return await safeFetch(`${API_BASE}/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('[API] Update supplier offline:', err.message);
    return data;
  }
};

// 6. Store Profile
export const apiUpdateStore = async (storeData) => {
  try {
    return await safeFetch(`${API_BASE}/store`, {
      method: 'PUT',
      body: JSON.stringify(storeData)
    });
  } catch (err) {
    console.warn('[API] Update store offline:', err.message);
    return storeData;
  }
};

// 7. Sync All (ensures full server-disk synchronization)
export const apiSyncAll = async (payload) => {
  try {
    return await safeFetch(`${API_BASE}/sync-all`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('[API] Sync all offline:', err.message);
    return { success: false };
  }
};

// 8. Reset Data to Seed
export const apiResetData = async () => {
  try {
    return await safeFetch(`${API_BASE}/reset`, {
      method: 'POST'
    });
  } catch (err) {
    console.warn('[API] Reset offline:', err.message);
    return { success: false };
  }
};
