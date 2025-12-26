// ============================================================================
// Constants
// ============================================================================

const VIEWER_PASSWORD = 'Gopal@23';
const ADMIN_PASSWORD = 'Shardul@1';
const STORAGE_KEY_AUTH = 'salesTracker_auth';
const STORAGE_KEY_ROLE = 'salesTracker_role';


const CATEGORIES = {
  BOOKS: 'Books',
  PHOTOS: 'Photos'
};

const BOOKS_LIST = [
'Balopasana',
'Nityopasana',
'Lahan Bhajan',
'Motha Bhajan',
'Gopalkala',
'Satvashil Raje',
'Santmela',
'Subodhbhanu',
'Triveni Sangam',
'Kathasumanhar',
'Shri Krishna Pratap',
'Siddharudh Vaibhav',
'Bodhamrut',
'Aainche Charitra',
'Gurumaay Gunagaan',
'Charitramrutsar',
'English Balopasana',
'Kannada Balopasana',
'Pravachan 1',
'Pravachan 2',
'Pravachan 3',
'Pravachan 4'
];

const PHOTOS_LIST = [
'Lahan Pandhri Sadi',
'Lahan Rangit Jod',
'Lahan Bhagavi Saadi',
'Lahan Pivla Haar',
'Lahan Stool Photo',

'Card size Pandhri Sadi',
'Card size Rangit Jod',
'Card size Bhagavi Saadi',
'Card size Pivla Haar',
'Card size Stool Photo',
'Card size Rangit Maharaj',

'Moṭhi Pandhri Sadi',
'Moṭhi Bhagavi Saadi',
'Moṭha Pivla Haar',
'Moṭha Stool Photo',
'Moṭhe Rangit Maharaj',
'Japmaal',
'Locket',
'Sarvat Mothi Pandhri Sadi',
'Sarvat Mothi Bhagavi Saadi',
'Sarvat Motha Pivla Haar',
'Sarvat Mothe Rangit Maharaj'

];

// ============================================================================
// Firebase Configuration
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAOVwdMR5cSrPaTeMFnYrBe6_qq7fRnuGQ",
  authDomain: "mandir-eb397.firebaseapp.com",
  projectId: "mandir-eb397",
  storageBucket: "mandir-eb397.firebasestorage.app",
  messagingSenderId: "188731582674",
  appId: "1:188731582674:web:e0ea99876f28692e04650b",
  measurementId: "G-3DYTXT4717"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get local date string (YYYY-MM-DD) to prevent timezone issues
 */
function getLocalDate() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

/**
 * Normalize product name to ID (lowercase, spaces to underscores)
 */
function getProductId(name) {
  return name.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/**
 * Toggle screen visibility
 */
function showScreen(screenId) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById(screenId).classList.remove('hidden');
}

/**
 * Toggle section visibility
 * Instant switching - no async blocking
 */
function showSection(sectionId) {
  console.log("NAVIGATION SWITCH", sectionId);
  // Hide all sections
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));

  // Show target section if exists
  const targetEl = document.getElementById(sectionId);
  if (targetEl) targetEl.classList.remove('hidden');

  // Update nav buttons (if any match)
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
  const sectionName = sectionId.replace('-section', '');
  const targetButton = document.querySelector(`[data-section="${sectionName}"]`);
  if (targetButton) targetButton.classList.add('active');

  // Trigger section-specific loaders
  if (sectionName === 'summary' && window.loadRecords) window.loadRecords();
  if (sectionName === 'monthly' && window.loadMonthlyData) window.loadMonthlyData();
  if (sectionName === 'prices' && window.loadPrices) window.loadPrices();
}

// ============================================================================
// Authentication
// ============================================================================

/**
 * Check if user is authenticated
 */
function checkAuth() {
  const authState = localStorage.getItem(STORAGE_KEY_AUTH);
  const role = localStorage.getItem(STORAGE_KEY_ROLE);
  const authExpiry = localStorage.getItem('salesTracker_authExpiry');
  
  // Check if auth exists, has a role, and hasn't expired
  if (authState === 'true' && role && authExpiry) {
    const expiryTime = Number(authExpiry);
    if (Date.now() < expiryTime) {
      console.log('Auth check: Valid, expires in', Math.round((expiryTime - Date.now()) / 1000 / 3600), 'hours');
      return true;
    } else {
      // Auth expired, clear it
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem('salesTracker_authExpiry');
      console.log('Auth check: Expired');
      return false;
    }
  }
  console.log('Auth check:', { authState, role, hasExpiry: !!authExpiry });
  return false;
}

/**
 * Set authentication state with 7-day expiry
 */
function setAuthState(authenticated) {
  if (authenticated) {
    const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    localStorage.setItem('salesTracker_authExpiry', expiryTime.toString());
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    localStorage.removeItem('salesTracker_authExpiry');
  }
  console.log('Auth state set:', authenticated, 'Role:', localStorage.getItem(STORAGE_KEY_ROLE));
}

function setUserRole(role) {
  localStorage.setItem(STORAGE_KEY_ROLE, role);
}

function getUserRole() {
  return localStorage.getItem(STORAGE_KEY_ROLE) || 'viewer';
}

/**
 * Initialize authentication
 */
function initAuth() {
  const authForm = document.getElementById('auth-form');
  const passwordInput = document.getElementById('password-input');
  const authError = document.getElementById('auth-error');
  
  // Check if already authenticated
  const isAuthed = checkAuth();

  if (isAuthed === true) {
    showScreen('app-screen');
  } else {
    setAuthState(false);
    showScreen('auth-screen');
  }

  // Handle form submission
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = passwordInput.value.trim();
    
    if (input === VIEWER_PASSWORD) {
      setAuthState(true);
      setUserRole('viewer');
      showScreen('app-screen');
      passwordInput.value = '';
      authError.textContent = '';
    } else if (input === ADMIN_PASSWORD) {
      setAuthState(true);
      setUserRole('admin');
      showScreen('app-screen');
      passwordInput.value = '';
      authError.textContent = '';
    } else if (input === 'shardul@1') {
      setAuthState(true);
      setUserRole('presenter');
      showScreen('app-screen');
      passwordInput.value = '';
      authError.textContent = '';
    } else {
      authError.textContent = 'Incorrect password. Try again.';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
  
  // Clear error on input
  passwordInput.addEventListener('input', () => {
    authError.textContent = '';
  });
}

/**
 * PWA Installation Prompt Handler
 */
let deferredPrompt;
function initPWAPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
  });
}

function showInstallPrompt() {
  // Create a custom install prompt
  const installDiv = document.createElement('div');
  installDiv.className = 'install-prompt';
  installDiv.innerHTML = `
    <div class="install-prompt-content">
      <span class="install-prompt-text">📱 Install Pustak Stall Entry as an app?</span>
      <div class="install-prompt-buttons">
        <button class="install-btn-install" id="install-btn">Install</button>
        <button class="install-btn-dismiss" id="dismiss-btn">Not now</button>
      </div>
    </div>
  `;
  document.body.appendChild(installDiv);

  const installBtn = document.getElementById('install-btn');
  const dismissBtn = document.getElementById('dismiss-btn');

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        installDiv.remove();
      }
    }
  });

  dismissBtn.addEventListener('click', () => {
    installDiv.remove();
  });
}

/**
 * Handle logout
 */
function handleLogout() {
  setAuthState(false);
  showScreen('auth-screen');
  document.getElementById('password-input').focus();
}

// ============================================================================
// Firebase Operations
// ============================================================================

/**
 * Record a sale in Firestore
 * Uses single sales/ collection with date+category+item as unique identifier
 */
async function recordSale(category, productName, date, quantity = 1) {
  const categoryLower = category.toLowerCase();
  const qty = parseInt(quantity) || 1;
  
  console.log(`Recording sale: ${category} - ${productName} (${date})`);
  
  try {
    // Query for existing document with same date, category, and item
    const salesRef = db.collection('sales');
    const query = salesRef
      .where('date', '==', date)
      .where('category', '==', categoryLower)
      .where('item', '==', productName)
      .limit(1);
    
    const querySnapshot = await query.get();
    
    let saleData;
    
    if (!querySnapshot.empty) {
      // Document exists - increment quantity
      const doc = querySnapshot.docs[0];
      const currentData = doc.data();
      const newQuantity = (currentData.quantity || 0) + qty;
      
      await doc.ref.update({
        date: date,
        category: categoryLower,
        item: productName,
        quantity: firebase.firestore.FieldValue.increment(qty),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      
      saleData = {
        date: date,
        category: categoryLower,
        item: productName,
        quantity: qty,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      
      console.log(`Updated existing sale: ${doc.id}`);
    } else {
      // Document doesn't exist - create new
      const newDocRef = salesRef.doc();
      saleData = {
        date: date,
        category: categoryLower,
        item: productName,
        quantity: qty,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      
      await newDocRef.set(saleData);
      console.log(`Created new sale document: ${newDocRef.id}`);
    }
    
    console.log("SALE WRITTEN", saleData);
  } catch (error) {
    console.error("Error recording sale:", error);
    throw error;
  }
}

// ============================================================================
// Dashboard (Sales Entry)
// ============================================================================

/**
 * Initialize dashboard
 */
function initDashboard() {
  const dateInput = document.getElementById('date-input');
  const categoryButtons = document.querySelectorAll('.category-button');
  const productSection = document.getElementById('product-section');
  const productGrid = document.getElementById('product-grid');
  const productSectionTitle = document.getElementById('product-section-title');
  
  let selectedDate = getLocalDate();
  let selectedCategory = null;
  let confirmProduct = null;
  
  // Set default date
  dateInput.value = selectedDate;
  
  // Handle date change
  dateInput.addEventListener('change', (e) => {
    selectedDate = e.target.value;
  });
  
  // Handle date navigation buttons
  const datePrevBtn = document.getElementById('date-prev-btn');
  const dateNextBtn = document.getElementById('date-next-btn');
  
  if (datePrevBtn) {
    datePrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const date = new Date(dateInput.value);
      date.setDate(date.getDate() - 1);
      const offset = date.getTimezoneOffset() * 60000;
      dateInput.value = new Date(date.getTime() - offset).toISOString().split('T')[0];
      selectedDate = dateInput.value;
    });
  }
  
  if (dateNextBtn) {
    dateNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const date = new Date(dateInput.value);
      date.setDate(date.getDate() + 1);
      const offset = date.getTimezoneOffset() * 60000;
      dateInput.value = new Date(date.getTime() - offset).toISOString().split('T')[0];
      selectedDate = dateInput.value;
    });
  }
  
  // Handle category selection
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      
      // Toggle active state
      categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.querySelector('.category-indicator').classList.add('hidden');
      });
      
      button.classList.add('active');
      button.querySelector('.category-indicator').classList.remove('hidden');
      
      selectedCategory = category;
      
      // Show product list
      renderProducts(category);
      productSection.classList.remove('hidden');
    });
  });
  
  /**
   * Render products for selected category
   */
  function renderProducts(category) {
    const products = category === CATEGORIES.BOOKS ? BOOKS_LIST : PHOTOS_LIST;
    productSectionTitle.textContent = `${category} Products`;
    productGrid.innerHTML = '';
    
    products.forEach(productName => {
      const button = document.createElement('button');
      button.className = 'product-button';
      button.innerHTML = `
        <span class="product-button-text">${productName}</span>
        <svg class="product-button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
      
      button.addEventListener('click', () => {
        confirmProduct = productName;
        showConfirmModal(category, productName);
      });
      
      productGrid.appendChild(button);
    });
  }
  
  /**
   * Show confirmation modal
   * Non-blocking, proper cleanup
   */
  function showConfirmModal(category, productName) {
    const modal = document.getElementById('confirm-modal');
    const modalCategory = document.getElementById('modal-category');
    const modalProduct = document.getElementById('modal-product');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalQuantityInput = document.getElementById('modal-quantity-input');
    
    // Reset modal state
    modalConfirm.disabled = false;
    modalConfirm.textContent = 'Confirm';
    modalQuantityInput.value = 1;
    
    modalCategory.textContent = category;
    modalProduct.textContent = productName;
    modal.classList.remove('hidden');
    
    // Focus on quantity input
    setTimeout(() => modalQuantityInput.focus(), 100);
    
    let isProcessing = false;
    
    // Handle cancel - always works, even during processing
    const handleCancel = () => {
      if (isProcessing) return; // Prevent cancel during processing
      modal.classList.add('hidden');
      confirmProduct = null;
    };
    
    // Handle confirm - async but non-blocking
    const handleConfirm = async () => {
      if (!selectedCategory || !confirmProduct || isProcessing) return;
      
      const quantity = parseInt(modalQuantityInput.value) || 1;
      
      isProcessing = true;
      modalConfirm.disabled = true;
      modalConfirm.textContent = 'Processing...';
      
      try {
        await recordSale(selectedCategory, confirmProduct, selectedDate, quantity);
        showToast(`Sold: ${confirmProduct} x${quantity}`, 'success');
        if (window.loadRecords) {
          window.loadRecords();
        }
        modal.classList.add('hidden');
        confirmProduct = null;
      } catch (error) {
        console.error("Sale recording error:", error);
        showToast('Failed to record sale. Check connection.', 'error');
      } finally {
        // Always reset button state
        isProcessing = false;
        modalConfirm.disabled = false;
        modalConfirm.textContent = 'Confirm';
      }
    };
    
    // Handle backdrop click
    const handleBackdrop = (e) => {
      if (e.target.classList.contains('modal-backdrop') && !isProcessing) {
        handleCancel();
      }
    };
    
    // Remove any existing listeners by cloning (clean slate)
    const newCancel = modalCancel.cloneNode(true);
    const newConfirm = modalConfirm.cloneNode(true);
    modalCancel.parentNode.replaceChild(newCancel, modalCancel);
    modalConfirm.parentNode.replaceChild(newConfirm, modalConfirm);
    
    // Add fresh event listeners
    newCancel.addEventListener('click', handleCancel);
    newConfirm.addEventListener('click', handleConfirm);
    modal.addEventListener('click', handleBackdrop);
  }
}

// ============================================================================
// Records (formerly Daily)
// ============================================================================

let recordsState = {
  isLoading: false,
  loadRecords: null
};

/**
 * Fetch records for a specific date (one doc per product/category/date)
 */
async function fetchRecordsByDate(date) {
  const rows = [];
  try {
    const snapshot = await db
      .collection('sales')
      .where('date', '==', date)
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data?.item || !data?.quantity) return;
      rows.push({
        id: doc.id,
        productName: String(data.item),
        total: Number(data.quantity || 0)
      });
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }

  return rows.sort((a, b) => a.productName.localeCompare(b.productName));
}

async function deleteRecord(docId) {
  await db.collection('sales').doc(docId).delete();
}

/**
 * Initialize records page
 */
function initRecords() {
  const dateInput = document.getElementById('summary-date-input');
  const summaryBody = document.getElementById('summary-body');
  const summaryCount = document.getElementById('summary-count');
  const refreshButton = document.getElementById('summary-refresh');

  let selectedDate = getLocalDate();
  dateInput.value = selectedDate;

  async function loadRecords() {
    if (recordsState.isLoading) return;

    recordsState.isLoading = true;
    refreshButton.classList.add('loading');
    refreshButton.disabled = true;

    summaryBody.innerHTML = `
      <div class="sheet-loading">
        <div class="spinner"></div>
        <span>Loading records...</span>
      </div>
    `;

    try {
      const rows = await fetchRecordsByDate(selectedDate);
      renderRows(rows);
    } catch (error) {
      console.error('Failed to load records', error);
      const errorMessage = error?.message || 'Failed to load records.';
      summaryBody.innerHTML = `
        <div class="sheet-error">
          <div class="sheet-error-title">Error</div>
          <div class="sheet-error-message">${errorMessage}</div>
        </div>
      `;
      summaryCount.textContent = 'Products: 0';
    } finally {
      recordsState.isLoading = false;
      refreshButton.classList.remove('loading');
      refreshButton.disabled = false;
    }
  }

  function renderRows(rows) {
    const role = getUserRole();
    summaryBody.innerHTML = '';

    if (!rows || rows.length === 0) {
      summaryBody.innerHTML = '<div class="sheet-empty">No sales for this date.</div>';
      summaryCount.textContent = 'Products: 0';
      return;
    }

    rows.forEach(({ id, productName, total }) => {
      const row = document.createElement('div');
      row.className = 'summary-row';
      row.innerHTML = `
        <div class="summary-cell-item" title="${productName}">${productName}</div>
        <div class="summary-cell-qty">
          <span class="sheet-qty-badge">${total}</span>
          ${role === 'admin' ? '<button class="row-delete-btn" aria-label="Delete record">×</button>' : ''}
        </div>
      `;

      if (role === 'admin') {
        const deleteBtn = row.querySelector('.row-delete-btn');
        deleteBtn.addEventListener('click', async () => {
          const confirmed = window.confirm(`Delete 1 unit of "${productName}" on ${selectedDate}?`);
          if (!confirmed) return;
          try {
            // Delete only one unit, not entire record
            const recordRef = db.collection('sales').doc(id);
            const recordDoc = await recordRef.get();
            if (recordDoc.exists) {
              const currentQty = recordDoc.data().quantity || 1;
              if (currentQty > 1) {
                await recordRef.update({ quantity: currentQty - 1 });
              } else {
                await recordRef.delete();
              }
            }
            await loadRecords();
            showToast('1 unit deleted', 'success');
          } catch (error) {
            console.error('Delete failed', error);
            showToast('Delete failed. Check console.', 'error');
          }
        });
      }

      summaryBody.appendChild(row);
    });

    summaryCount.textContent = `Products: ${rows.length}`;
  }

  dateInput.addEventListener('change', (e) => {
    selectedDate = e.target.value;
    loadRecords();
  });

  refreshButton.addEventListener('click', () => loadRecords());

  // Date navigation buttons for Records page
  const summaryDatePrevBtn = document.getElementById('summary-date-prev-btn');
  const summaryDateNextBtn = document.getElementById('summary-date-next-btn');
  
  if (summaryDatePrevBtn) {
    summaryDatePrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const date = new Date(dateInput.value);
      date.setDate(date.getDate() - 1);
      const offset = date.getTimezoneOffset() * 60000;
      dateInput.value = new Date(date.getTime() - offset).toISOString().split('T')[0];
      selectedDate = dateInput.value;
      loadRecords();
    });
  }
  
  if (summaryDateNextBtn) {
    summaryDateNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const date = new Date(dateInput.value);
      date.setDate(date.getDate() + 1);
      const offset = date.getTimezoneOffset() * 60000;
      dateInput.value = new Date(date.getTime() - offset).toISOString().split('T')[0];
      selectedDate = dateInput.value;
      loadRecords();
    });
  }

  recordsState.loadRecords = loadRecords;
  window.loadRecords = loadRecords;
}

// ============================================================================
// Monthly Records
// ============================================================================

/**
 * Initialize monthly records page
 */
function initMonthly() {
  const monthInput = document.getElementById('monthly-month-input');
  const categoryButtons = document.querySelectorAll('.monthly-category');
  const tableContainer = document.getElementById('monthly-table-container');
  
  let selectedMonth = getLocalDate().substring(0, 7); // YYYY-MM
  let selectedCategory = 'books'; // Default to books
  let monthData = {}; // Store current month's sales data for use in modals
  
  // Set default month
  monthInput.value = selectedMonth;
  
  // Set default category to Books
  const defaultBooksBtn = document.querySelector('[data-category="books"].monthly-category');
  if (defaultBooksBtn) {
    defaultBooksBtn.classList.add('active');
    defaultBooksBtn.querySelector('.category-indicator').classList.remove('hidden');
  }
  
  // Handle month change
  monthInput.addEventListener('change', (e) => {
    selectedMonth = e.target.value;
    if (selectedCategory) {
      loadMonthlyData();
    }
  });
  
  // Handle category selection
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      
      // Update indicator
      button.querySelector('.category-indicator').classList.remove('hidden');
      categoryButtons.forEach(btn => {
        if (btn !== button) {
          btn.querySelector('.category-indicator').classList.add('hidden');
        }
      });
      
      selectedCategory = button.getAttribute('data-category').toLowerCase();
      loadMonthlyData();
    });
  });
  
  /**
   * Create product order index map
   */
  function getProductOrderIndex(category) {
    const list = category === 'books' ? BOOKS_LIST : PHOTOS_LIST;
    const indexMap = {};
    list.forEach((product, index) => {
      indexMap[product.toLowerCase()] = index;
    });
    return indexMap;
  }
  
  /**
   * Sort products by predefined list order
   */
  function sortProductsByList(products, category) {
    const indexMap = getProductOrderIndex(category);
    
    return products.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aIndex = indexMap[aLower] !== undefined ? indexMap[aLower] : Infinity;
      const bIndex = indexMap[bLower] !== undefined ? indexMap[bLower] : Infinity;
      
      // If both are in the list, use list order
      if (aIndex !== Infinity && bIndex !== Infinity) {
        return aIndex - bIndex;
      }
      // If only one is in the list, it comes first
      if (aIndex !== Infinity) return -1;
      if (bIndex !== Infinity) return 1;
      // If neither is in list, sort alphabetically
      return a.localeCompare(b);
    });
  }
  
  /**
   * Fetch monthly sales data from Firestore
   */
  async function fetchMonthlyData(category, yearMonth) {
    const categoryLower = category.toLowerCase();
    const [year, month] = yearMonth.split('-');
    const monthStart = `${year}-${month}-01`;
    const monthEnd = `${year}-${month}-31`;
    
    try {
      const snapshot = await db
        .collection('sales')
        .where('category', '==', categoryLower)
        .get();
      
      const monthData = {};
      const products = new Set();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.date;
        
        // Filter by month in JavaScript
        if (date >= monthStart && date <= monthEnd) {
          const item = data.item;
          const quantity = data.quantity || 1;
          
          products.add(item);
          
          if (!monthData[item]) {
            monthData[item] = {};
          }
          if (!monthData[item][date]) {
            monthData[item][date] = 0;
          }
          monthData[item][date] += Number(quantity || 1);
        }
      });
      
      return { monthData, products: sortProductsByList(Array.from(products), category) };
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      throw error;
    }
  }
  
  /**
   * Get all dates in the month
   */
  function getDatesInMonth(yearMonth) {
    const [year, month] = yearMonth.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    const dates = [];
    
    while (date.getMonth() === parseInt(month) - 1) {
      const d = new Date(date);
      const offset = d.getTimezoneOffset() * 60000;
      const localDate = new Date(d.getTime() - offset).toISOString().split('T')[0];
      dates.push(localDate);
      date.setDate(date.getDate() + 1);
    }
    
    return dates;
  }
  
  /**
   * Helper: fetch monthly records (previous/remaining) map for a month
   */
  async function fetchMonthlyRecordsMap(category, yearMonth) {
    const collectionName = category === 'books' ? 'monthly_records_books' : 'monthly_records_photos';
    const map = {};
    try {
      const snapshot = await db.collection(collectionName).where('month', '==', yearMonth).get();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.product) map[data.product] = Object.assign({}, data);
      });
    } catch (err) {
      console.error('Error fetching monthly records:', err);
    }
    return map;
  }

  /**
   * Helper: fetch price map (price effective by month end) for all products
   */
  async function fetchPricesForMonth(category, yearMonth) {
    const collectionName = category === 'books' ? 'product_prices_books' : 'product_prices_photos';
    const map = {};
    const [year, month] = yearMonth.split('-').map(s => Number(s));
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();
    try {
      const snapshot = await db.collection(collectionName).get();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data || !data.product) return;
        const p = data.product;
        const ts = data.updatedAt && data.updatedAt.toMillis ? data.updatedAt.toMillis() : (data.updatedAt ? new Date(data.updatedAt).getTime() : 0);
        if (ts <= monthEnd) {
          if (!map[p] || ts > map[p].time) {
            map[p] = { price: data.price, time: ts };
          }
        }
      });
    } catch (err) {
      console.error('Error fetching prices for month:', err);
    }
    return map;
  }

  /**
   * Render monthly table with expanded/compact views, previous/remaining, variance and revenue
   */
  async function renderMonthlyTable(monthData, products, dates, monthRecordsMap, pricesMap) {
    if (!products || products.length === 0) {
      tableContainer.innerHTML = `
        <div class="sheet-empty">
          <p>No sales data for this month</p>
        </div>
      `;
      return;
    }

    // Build header
    let html = '<div class="monthly-table-wrapper"><table class="monthly-table"><thead><tr>';
    html += '<th class="monthly-cell monthly-cell-product header-toggle" style="cursor: pointer;">Product</th>';

    dates.forEach(date => {
      const day = new Date(date).getDate();
      html += `<th class="monthly-cell monthly-cell-date">${day}</th>`;
    });

    // New order: Previous, Total Sales, Remaining, Revenue, Variance
    html += '<th class="monthly-cell monthly-cell-prev">Previous</th>';
    html += '<th class="monthly-cell monthly-cell-total">Total Sales</th>';
    html += '<th class="monthly-cell monthly-cell-remaining">Remaining</th>';
    html += '<th class="monthly-cell monthly-cell-revenue">Revenue</th>';
    html += '<th class="monthly-cell monthly-cell-variance">Variance</th>';
    html += '</tr></thead><tbody>';

    // Rows
    products.forEach(product => {
      html += '<tr>';
      html += `<td class="monthly-cell monthly-cell-product" title="${product}">${product}</td>`;

      let productTotal = 0;
      dates.forEach(date => {
        const qty = monthData[product] && monthData[product][date] ? monthData[product][date] : 0;
        html += `<td class="monthly-cell monthly-cell-date-qty">${qty}</td>`;
        productTotal += qty;
      });

      // placeholders for the accounting columns (filled after)
      html += `<td class="monthly-cell monthly-cell-prev" data-product="${product}">-</td>`;
      html += `<td class="monthly-cell monthly-cell-total"><strong>${productTotal}</strong></td>`;
      html += `<td class="monthly-cell monthly-cell-remaining" data-product="${product}">-</td>`;
      html += `<td class="monthly-cell monthly-cell-revenue" data-product="${product}">-</td>`;
      html += `<td class="monthly-cell monthly-cell-variance" data-product="${product}"><span class="editable-cell" data-type="variance" style="cursor: pointer;">-</span></td>`;

      html += '</tr>';
    });

    html += '</tbody></table></div>';
    tableContainer.innerHTML = html;

    // Toggle behavior bound to Product header
    const productHeader = tableContainer.querySelector('.header-toggle');
    if (productHeader) {
      productHeader.addEventListener('click', () => {
        // Toggle dates vs accounting view
        tableContainer.querySelectorAll('.monthly-cell-date').forEach(cell => cell.classList.toggle('hidden'));
        tableContainer.querySelectorAll('.monthly-cell-date-qty').forEach(cell => cell.classList.toggle('hidden'));
      });
    }

    // Now populate accounting columns (fetch month records and prices for shown products)
    products.forEach(product => {
      const rowPrev = tableContainer.querySelector(`.monthly-cell-prev[data-product="${product}"]`);
      const rowRemaining = tableContainer.querySelector(`.monthly-cell-remaining[data-product="${product}"]`);
      const rowVariance = tableContainer.querySelector(`.monthly-cell-variance[data-product="${product}"]`);
      const rowRevenue = tableContainer.querySelector(`.monthly-cell-revenue[data-product="${product}"]`);

      const rec = monthRecordsMap && monthRecordsMap[product] ? monthRecordsMap[product] : {};
      const prev = rec.previousStock !== undefined ? Number(rec.previousStock) : null;
      const variance = rec.variance !== undefined ? rec.variance : null;
      const total = Array.from(monthData[product] ? Object.values(monthData[product]) : []).reduce((s, v) => s + Number(v || 0), 0);
      const remaining = prev !== null ? (prev - total) : null;

      if (rowPrev) rowPrev.innerHTML = `<span class="editable-cell" data-product="${product}" style="cursor: pointer;">${prev !== null ? prev : '-'}</span>`;
      if (rowRemaining) rowRemaining.innerHTML = remaining !== null ? `<span>${remaining}</span>` : '-';
      if (rowVariance) rowVariance.innerHTML = `<span class="editable-cell" data-product="${product}" data-type="variance" style="cursor: pointer;">${variance !== null ? variance : '-'}</span>`;

      // revenue = total sales * price (price fetched from pricesMap)
      const priceInfo = pricesMap && pricesMap[product] ? pricesMap[product] : null;
      const price = priceInfo && priceInfo.price !== undefined ? Number(priceInfo.price) : null;
      const revenue = (price !== null) ? (price * total) : null;
      if (rowRevenue) rowRevenue.innerHTML = revenue === null ? '-' : `<span class="editable-cell" data-product="${product}" data-type="revenue" style="cursor: pointer;">${Math.round(revenue)}</span>`;
    });

    // Attach handlers for clickable previous, variance, and revenue cells
    tableContainer.querySelectorAll('.editable-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const product = e.target.getAttribute('data-product');
        const type = e.target.getAttribute('data-type') || 'previous';
        if (type === 'variance') {
          showVarianceModal(selectedCategory, product);
        } else if (type === 'revenue') {
          showMonthlySummary(selectedCategory, selectedMonth, monthData, pricesMap);
        } else {
          showPrevStockModal(selectedCategory, product);
        }
      });
    });
  }

  // Helper: get monthly record doc ref
  function getMonthlyRecordRef(category, product, month) {
    const collectionName = category === 'books' ? 'monthly_records_books' : 'monthly_records_photos';
    const id = `${month}_${getProductId(product)}`;
    return db.collection(collectionName).doc(id);
  }

  async function fetchMonthlyRecord(category, product, month) {
    try {
      const ref = getMonthlyRecordRef(category, product, month);
      const doc = await ref.get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.error('Error fetching monthly record:', err);
      return null;
    }
  }

  async function updateMonthlyRecord(category, product, month, fields) {
    try {
      const ref = getMonthlyRecordRef(category, product, month);
      await ref.set(Object.assign({ product: product, month: month }, fields, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }), { merge: true });
    } catch (err) {
      console.error('Error updating monthly record:', err);
      throw err;
    }
  }

  async function propagateRemainingToNextMonth(category, product, month, remaining) {
    try {
      const [year, monthStr] = month.split('-');
      const monthNum = Number(monthStr); // 1-indexed from string (1-12)
      // Date constructor is 0-indexed, so subtract 1, get next month, add 1 back
      const currentDate = new Date(Number(year), monthNum - 1, 1); // Convert to 0-indexed
      currentDate.setMonth(currentDate.getMonth() + 1); // Move to next month
      const nextYear = currentDate.getFullYear();
      const nextMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Convert back to 1-indexed
      const nextMonthStr = `${nextYear}-${nextMonth}`;
      const ref = getMonthlyRecordRef(category, product, nextMonthStr);
      await ref.set({ product: product, month: nextMonthStr, previousStock: Number(remaining), updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Error propagating remaining to next month:', err);
    }
  }

  // Auto-propagate all remaining stocks from current month to next month
  async function autoPropagateRemainingStocks(category, month, monthData, monthRecordsMap) {
    try {
      const products = Object.keys(monthData);
      for (const product of products) {
        const rec = monthRecordsMap && monthRecordsMap[product] ? monthRecordsMap[product] : {};
        const prev = rec.previousStock !== undefined ? Number(rec.previousStock) : null;
        const total = Array.from(monthData[product] ? Object.values(monthData[product]) : []).reduce((s, v) => s + Number(v || 0), 0);
        const remaining = prev !== null ? (prev - total) : null;
        
        if (remaining !== null && remaining > 0) {
          await propagateRemainingToNextMonth(category, product, month, remaining);
        }
      }
    } catch (err) {
      console.error('Error in auto-propagate:', err);
    }
  }

  // Show previous stock modal
  function showPrevStockModal(category, product) {
    const role = getUserRole();
    if (role !== 'admin') {
      showToast('Only admins can edit previous stock', 'error');
      return;
    }

    const modal = document.getElementById('prev-stock-modal');
    const productLabel = document.getElementById('prev-modal-product');
    const input = document.getElementById('prev-modal-input');
    const notes = document.getElementById('prev-modal-notes');
    const cancel = document.getElementById('prev-modal-cancel');
    const save = document.getElementById('prev-modal-save');

    productLabel.textContent = product;
    // load current value
    fetchMonthlyRecord(category, product, selectedMonth).then(rec => {
      input.value = rec && rec.previousStock !== undefined ? rec.previousStock : '';
      notes.value = rec && rec.notes ? rec.notes : '';
    });

    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);

    const handleCancel = () => modal.classList.add('hidden');

    const handleSave = async () => {
      const value = Number(input.value);
      const noteText = notes.value || '';
      if (isNaN(value) || value < 0) {
        showToast('Invalid quantity', 'error');
        return;
      }
      save.disabled = true;
      save.textContent = 'Saving...';
      try {
        await updateMonthlyRecord(category, product, selectedMonth, { previousStock: Number(value), notes: noteText });
        showToast('Previous stock saved', 'success');
        modal.classList.add('hidden');
        if (window.loadMonthlyData) await window.loadMonthlyData();
      } catch (err) {
        showToast('Failed to save previous stock', 'error');
      } finally {
        save.disabled = false;
        save.textContent = 'Save';
      }
    };

    // Replace listeners
    const newCancel = cancel.cloneNode(true);
    const newSave = save.cloneNode(true);
    cancel.parentNode.replaceChild(newCancel, cancel);
    save.parentNode.replaceChild(newSave, save);
    newCancel.addEventListener('click', handleCancel);
    newSave.addEventListener('click', handleSave);
  }

  // Show variance modal
  function showVarianceModal(category, product) {
    const role = getUserRole();
    if (role !== 'admin') {
      showToast('Only admins can edit variance', 'error');
      return;
    }

    const modal = document.getElementById('variance-modal');
    const productLabel = document.getElementById('variance-modal-product');
    const input = document.getElementById('variance-modal-input');
    const cancel = document.getElementById('variance-modal-cancel');
    const save = document.getElementById('variance-modal-save');

    productLabel.textContent = product;
    // load current value
    fetchMonthlyRecord(category, product, selectedMonth).then(rec => {
      input.value = rec && rec.variance !== undefined ? rec.variance : '';
    });

    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);

    const handleCancel = () => modal.classList.add('hidden');

    const handleSave = async () => {
      const value = input.value === '' ? null : Number(input.value);
      if (value !== null && isNaN(value)) {
        showToast('Invalid number', 'error');
        return;
      }

      save.disabled = true;
      save.textContent = 'Saving...';
      try {
        await updateMonthlyRecord(category, product, selectedMonth, { variance: value });
        showToast('Variance saved', 'success');
        modal.classList.add('hidden');
        if (window.loadMonthlyData) await window.loadMonthlyData();
      } catch (err) {
        showToast('Failed to save variance', 'error');
      } finally {
        save.disabled = false;
        save.textContent = 'Save';
      }
    };

    // Replace listeners
    const newCancel = cancel.cloneNode(true);
    const newSave = save.cloneNode(true);
    cancel.parentNode.replaceChild(newCancel, cancel);
    save.parentNode.replaceChild(newSave, save);
    newCancel.addEventListener('click', handleCancel);
    newSave.addEventListener('click', handleSave);
  }

  function showMonthlySummary(category, month, monthData, pricesMap) {
    // Calculate revenue for each category
    let booksRevenue = 0;
    let photosRevenue = 0;

    // Get books and photos lists
    const booksProducts = BOOKS_LIST;
    const photosProducts = PHOTOS_LIST;

    // Calculate books revenue
    booksProducts.forEach(product => {
      if (monthData && monthData[product]) {
        const total = Array.from(Object.values(monthData[product])).reduce((s, v) => s + Number(v || 0), 0);
        const priceInfo = pricesMap && pricesMap[product];
        const price = priceInfo && priceInfo.price !== undefined ? Number(priceInfo.price) : null;
        if (price !== null && total > 0) {
          booksRevenue += price * total;
        }
      }
    });

    // Calculate photos revenue
    photosProducts.forEach(product => {
      if (monthData && monthData[product]) {
        const total = Array.from(Object.values(monthData[product])).reduce((s, v) => s + Number(v || 0), 0);
        const priceInfo = pricesMap && pricesMap[product];
        const price = priceInfo && priceInfo.price !== undefined ? Number(priceInfo.price) : null;
        if (price !== null && total > 0) {
          photosRevenue += price * total;
        }
      }
    });

    const totalRevenue = booksRevenue + photosRevenue;
    const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Show toast with summary
    const summaryText = `${monthName} Revenue:\n📚 Books: ₹${Math.round(booksRevenue)}\n📸 Photos: ₹${Math.round(photosRevenue)}\n\n📊 Total: ₹${Math.round(totalRevenue)}`;
    
    // Create a custom toast for summary
    const toast = document.getElementById('toast');
    toast.innerHTML = `<div style="white-space: pre-line; text-align: left; font-weight: 500;">${summaryText}</div>`;
    toast.classList.remove('hidden');
    toast.className = 'toast success';
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 5000);
  }

  async function loadMonthlyData() {
    if (!selectedCategory) {
      tableContainer.innerHTML = `
        <div class="sheet-empty">
          <p>Select Books or Photos</p>
        </div>
      `;
      return;
    }
    
    tableContainer.innerHTML = `
      <div class="sheet-loading">
        <div class="spinner"></div>
        <span>Loading monthly data...</span>
      </div>
    `;
    
    try {
      const { monthData: data, products } = await fetchMonthlyData(selectedCategory, selectedMonth);
      monthData = data; // Store for use in modal handlers
      const dates = getDatesInMonth(selectedMonth);
      const monthRecordsMap = await fetchMonthlyRecordsMap(selectedCategory, selectedMonth);
      const pricesMap = await fetchPricesForMonth(selectedCategory, selectedMonth);

      await renderMonthlyTable(monthData, products, dates, monthRecordsMap, pricesMap);
      
      // Auto-propagate remaining stocks to next month
      await autoPropagateRemainingStocks(selectedCategory, selectedMonth, monthData, monthRecordsMap);

      // Update summary card with both categories
      await updateMonthlySummaryCard(selectedMonth, monthData, pricesMap, selectedCategory);
    } catch (error) {
      console.error('Error loading monthly data:', error);
      tableContainer.innerHTML = `
        <div class="sheet-error">
          <h3 class="sheet-error-title">Error</h3>
          <p class="sheet-error-message">Failed to load data. Please try again.</p>
        </div>
      `;
    }
  }

  async function updateMonthlySummaryCard(month, monthData, pricesMap, currentCategory) {
    try {
      // Calculate revenue for current category
      let currentRevenue = 0;
      let otherRevenue = 0;

      // Calculate current category revenue (from loaded monthData)
      Object.keys(monthData).forEach(product => {
        if (monthData[product]) {
          const total = Array.from(Object.values(monthData[product])).reduce((s, v) => s + Number(v || 0), 0);
          const priceInfo = pricesMap && pricesMap[product];
          const price = priceInfo && priceInfo.price !== undefined ? Number(priceInfo.price) : null;
          if (price !== null && total > 0) {
            currentRevenue += price * total;
          }
        }
      });

      // Fetch and calculate the other category's revenue
      const otherCategory = currentCategory === 'books' ? 'photos' : 'books';
      try {
        const { monthData: otherMonthData } = await fetchMonthlyData(otherCategory, month);
        const otherPricesMap = await fetchPricesForMonth(otherCategory, month);

        Object.keys(otherMonthData).forEach(product => {
          if (otherMonthData[product]) {
            const total = Array.from(Object.values(otherMonthData[product])).reduce((s, v) => s + Number(v || 0), 0);
            const priceInfo = otherPricesMap && otherPricesMap[product];
            const price = priceInfo && priceInfo.price !== undefined ? Number(priceInfo.price) : null;
            if (price !== null && total > 0) {
              otherRevenue += price * total;
            }
          }
        });
      } catch (err) {
        console.log('Could not fetch other category revenue:', err);
      }

      const booksRevenue = currentCategory === 'books' ? currentRevenue : otherRevenue;
      const photosRevenue = currentCategory === 'photos' ? currentRevenue : otherRevenue;
      const totalRevenue = booksRevenue + photosRevenue;
      const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Update card
      const summaryCard = document.getElementById('monthly-summary-card');
      const titleEl = document.getElementById('monthly-summary-title');
      const booksEl = document.getElementById('summary-books-revenue');
      const photosEl = document.getElementById('summary-photos-revenue');
      const totalEl = document.getElementById('summary-total-revenue');

      if (summaryCard && titleEl && booksEl && photosEl && totalEl) {
        titleEl.textContent = monthName;
        booksEl.textContent = '₹' + Math.round(booksRevenue).toLocaleString('en-IN');
        photosEl.textContent = '₹' + Math.round(photosRevenue).toLocaleString('en-IN');
        totalEl.textContent = '₹' + Math.round(totalRevenue).toLocaleString('en-IN');
        summaryCard.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error updating summary card:', err);
    }
  }

  window.loadMonthlyData = loadMonthlyData;
  
  // Load default data for the first time
  loadMonthlyData();
}

/**
 * Prices / Price Update page
 * Accessible from Dashboard via 'Update Prices' button
 */
function initPricePage() {
  const openPricesBtn = document.getElementById('open-prices-page');
  const categoryButtons = document.querySelectorAll('.prices-category');
  const container = document.getElementById('prices-table-container');
  let selectedCategory = 'books'; // Default to books
  
  // Set default category button
  const defaultBooksBtn = document.querySelector('[data-category="books"].prices-category');
  if (defaultBooksBtn) {
    defaultBooksBtn.classList.add('active');
  }

  if (openPricesBtn) {
    openPricesBtn.addEventListener('click', () => showSection('prices-section'));
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.getAttribute('data-category');
      if (window.loadPrices) window.loadPrices();
    });
  });

  async function fetchAllPriceDocs(category) {
    const collectionName = category === 'books' ? 'product_prices_books' : 'product_prices_photos';
    try {
      const snapshot = await db.collection(collectionName).get();
      const docs = [];
      snapshot.forEach(doc => {
        docs.push(Object.assign({ id: doc.id }, doc.data()));
      });
      return docs;
    } catch (error) {
      console.error('Error fetching price docs:', error);
      throw error;
    }
  }

  async function loadPrices() {
    if (!selectedCategory) {
      container.innerHTML = '<div class="sheet-empty"><p>Select Books or Photos to manage prices</p></div>';
      return;
    }

    container.innerHTML = '<div class="sheet-loading"><div class="spinner"></div><span>Loading prices...</span></div>';

    try {
      const docs = await fetchAllPriceDocs(selectedCategory);
      const latest = {};
      docs.forEach(d => {
        const key = d.product;
        const ts = d.updatedAt && d.updatedAt.toMillis ? d.updatedAt.toMillis() : (d.updatedAt ? new Date(d.updatedAt).getTime() : 0);
        if (!latest[key] || ts > latest[key].time) {
          latest[key] = { price: d.price, updatedAt: d.updatedAt, time: ts };
        }
      });

      const products = selectedCategory === 'books' ? BOOKS_LIST : PHOTOS_LIST;
      let html = '<table class="prices-table"><thead><tr><th>Product</th><th class="price-cell">Current Price</th><th class="date-cell">Last Updated</th><th></th></tr></thead><tbody>';

      products.forEach(p => {
        const info = latest[p] || {};
        const priceDisplay = info.price !== undefined ? Number(info.price).toFixed(2) : '-';
        const updated = info.updatedAt ? (info.updatedAt.toDate ? info.updatedAt.toDate().toLocaleString() : new Date(info.updatedAt).toLocaleString()) : '-';
        html += `<tr data-product="${p}"><td>${p}</td><td class="price-cell">${priceDisplay}</td><td class="date-cell">${updated}</td><td><button class="price-edit-button small">Edit</button></td></tr>`;
      });

      html += '</tbody></table>';
      container.innerHTML = html;

      const role = getUserRole();
      container.querySelectorAll('.price-edit-button').forEach(btn => {
        if (role !== 'admin' && role !== 'presenter') {
          btn.disabled = true;
          btn.textContent = 'Locked';
          btn.classList.add('disabled');
          return;
        }
        btn.addEventListener('click', (e) => {
          const row = e.target.closest('tr');
          const product = row.getAttribute('data-product');
          const cur = latest[product] || {};
          showPriceModal(selectedCategory, product, cur);
        });
      });
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="sheet-error"><h3 class="sheet-error-title">Error</h3><p class="sheet-error-message">Failed to load prices.</p></div>';
    }
  }

  function showPriceModal(category, product, currentInfo) {
    const modal = document.getElementById('price-modal');
    const productLabel = document.getElementById('price-modal-product');
    const input = document.getElementById('price-modal-input');
    const cancel = document.getElementById('price-modal-cancel');
    const save = document.getElementById('price-modal-save');

    productLabel.textContent = product;
    input.value = currentInfo && currentInfo.price !== undefined ? currentInfo.price : '';
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);

    const handleCancel = () => modal.classList.add('hidden');

    const handleSave = async () => {
      const value = Number(input.value);
      if (isNaN(value) || value < 0) {
        showToast('Invalid price value', 'error');
        return;
      }

      save.disabled = true;
      save.textContent = 'Saving...';

      try {
        const collectionName = category === 'books' ? 'product_prices_books' : 'product_prices_photos';
        await db.collection(collectionName).add({
          product: product,
          price: value,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast('Price updated', 'success');
        modal.classList.add('hidden');
        await loadPrices();
      } catch (err) {
        console.error('Save price failed', err);
        showToast('Failed to save price', 'error');
      } finally {
        save.disabled = false;
        save.textContent = 'Save';
      }
    };

    // Remove/replace old listeners
    const newCancel = cancel.cloneNode(true);
    const newSave = save.cloneNode(true);
    cancel.parentNode.replaceChild(newCancel, cancel);
    save.parentNode.replaceChild(newSave, save);
    newCancel.addEventListener('click', handleCancel);
    newSave.addEventListener('click', handleSave);
  }

  window.loadPrices = loadPrices;
}

// ============================================================================
// Navigation
// ============================================================================

/**
 * Initialize navigation
 * Simple, instant switching with no blocking
 */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-button');
  
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const section = button.dataset.section;
      if (section) {
        showSection(`${section}-section`);
      }
    });
  });
}

// ============================================================================
// Service Worker Registration
// ============================================================================

/**
 * Register service worker
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// ============================================================================
// App Initialization
// ============================================================================

/**
 * Initialize the application
 */
function initApp() {
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered:', reg))
      .catch((err) => console.log('Service Worker registration failed:', err));
  }

  // Initialize PWA installation prompt
  initPWAPrompt();

  // Initialize authentication
  initAuth();
  
  // Initialize dashboard
  initDashboard();
  
  // Initialize records page
  initRecords();
  
  // Initialize monthly records page
  initMonthly();

  // Initialize price update page
  initPricePage();
  
  // Initialize navigation
  initNavigation();
  
  // Setup logout button
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  // Register service worker
  registerServiceWorker();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

