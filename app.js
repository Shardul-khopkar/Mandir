// ============================================================================
// Performance Optimization Utilities
// ============================================================================

/**
 * Debounce function to prevent excessive function calls
 */
function debounce(func, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function to limit function calls
 */
function throttle(func, limit = 1000) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoize function results for repeated calls
 */
function memoize(func) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    }
    const result = func.apply(this, args);
    cache[key] = result;
    return result;
  };
}

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
  
  // Add fade + slide animation to current section
  const currentSection = document.querySelector('.section:not(.hidden)');
  if (currentSection) {
    currentSection.style.animation = 'none';
    currentSection.offsetHeight; // Trigger reflow
    currentSection.style.animation = 'oxygenPageOut 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    
    setTimeout(() => {
      // Hide all sections
      document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
      
      // Show target section if exists
      const targetEl = document.getElementById(sectionId);
      if (targetEl) {
        targetEl.classList.remove('hidden');
        targetEl.style.animation = 'oxygenPageIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
      }
      
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  } else {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    
    // Show target section if exists
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.classList.remove('hidden');
      targetEl.style.animation = 'oxygenPageIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav buttons with smooth transitions
  document.querySelectorAll('.nav-button').forEach(btn => {
    btn.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    btn.classList.remove('active');
  });
  const sectionName = sectionId.replace('-section', '');
  const targetButton = document.querySelector(`[data-section="${sectionName}"]`);
  if (targetButton) targetButton.classList.add('active');

  // Trigger section-specific loaders
  if (sectionName === 'summary' && window.loadRecords) window.loadRecords();
  if (sectionName === 'monthly' && window.loadMonthlyData) window.loadMonthlyData();
  if (sectionName === 'cashflow' && window.loadCashflow) window.loadCashflow();
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
// Helper: Build Latest Price Map
// ============================================================================

/**
 * Extract latest price for each product from price documents
 * Handles timestamp conversion and selects most recent price
 * 
 * @param {Array} priceDocuments - Array of Firestore snapshot docs from price collection
 * @returns {Object} Map of product name -> { price, time }
 */
function buildLatestPriceMap(priceDocuments) {
  const map = {};
  priceDocuments.forEach(doc => {
    const data = doc.data();
    if (!data || !data.product) return;
    const ts = data.updatedAt && data.updatedAt.toMillis 
      ? data.updatedAt.toMillis() 
      : (data.updatedAt ? new Date(data.updatedAt).getTime() : 0);
    if (!map[data.product] || ts > map[data.product].time) {
      map[data.product] = { price: data.price, time: ts };
    }
  });
  return map;
}

// ============================================================================
// Firebase Operations
// ============================================================================

/**
 * Record a sale in Firestore
 * Uses single sales/ collection with date+category+item as unique identifier
 */
async function recordSale(category, productName, date, quantity = 1, hookType = null) {
  const categoryLower = category.toLowerCase();
  const qty = parseInt(quantity) || 1;
  
  console.log(`Recording sale: ${category} - ${productName} (${date})${hookType ? ` - Hook: ${hookType}` : ''}`);
  
  try {
    // Query for existing document with same date, category, and item
    const salesRef = db.collection('sales');
    let query = salesRef
      .where('date', '==', date)
      .where('category', '==', categoryLower)
      .where('item', '==', productName);
    
    // If hookType is provided, include it in the query
    if (hookType) {
      query = query.where('hookType', '==', hookType);
    }
    
    query = query.limit(1);
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
      
      if (hookType) {
        await doc.ref.update({ hookType: hookType });
      }
      
      saleData = {
        date: date,
        category: categoryLower,
        item: productName,
        quantity: qty,
        ...(hookType && { hookType: hookType }),
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
        ...(hookType && { hookType: hookType }),
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
  const categoryButtons = document.querySelectorAll('.category-pill-button');
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
      });
      
      button.classList.add('active');
      
      // Update pill slider animation
      const container = button.closest('.category-pill-container');
      if (container) {
        updatePillSlider(container);
      }
      
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
    const locketHookContainer = document.getElementById('modal-locket-hook-container');
    const hookWithBtn = document.getElementById('modal-hook-with');
    const hookWithoutBtn = document.getElementById('modal-hook-without');
    const hookTypeInput = document.getElementById('modal-hook-type');
    
    // Reset modal state
    modalConfirm.disabled = false;
    modalConfirm.textContent = 'Confirm';
    modalQuantityInput.value = 1;
    hookTypeInput.value = 'hook';
    
    modalCategory.textContent = category;
    modalProduct.textContent = productName;
    
    // Show/hide hook selector based on product
    const isLocket = productName.toLowerCase() === 'locket';
    if (isLocket) {
      locketHookContainer.classList.remove('hidden');
      hookWithBtn.classList.add('active');
      hookWithoutBtn.classList.remove('active');
    } else {
      locketHookContainer.classList.add('hidden');
    }
    
    modal.classList.remove('hidden');
    
    // Focus on quantity input
    setTimeout(() => modalQuantityInput.focus(), 100);
    
    let isProcessing = false;
    
    // Handle hook button clicks
    const handleHookWith = () => {
      hookTypeInput.value = 'hook';
      hookWithBtn.classList.add('active');
      hookWithoutBtn.classList.remove('active');
    };
    
    const handleHookWithout = () => {
      hookTypeInput.value = 'no-hook';
      hookWithBtn.classList.remove('active');
      hookWithoutBtn.classList.add('active');
    };
    
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
      const hookType = isLocket ? hookTypeInput.value : null;
      
      isProcessing = true;
      modalConfirm.disabled = true;
      modalConfirm.textContent = 'Processing...';
      
      try {
        await recordSale(selectedCategory, confirmProduct, selectedDate, quantity, hookType);
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
    const newHookWith = hookWithBtn.cloneNode(true);
    const newHookWithout = hookWithoutBtn.cloneNode(true);
    
    modalCancel.parentNode.replaceChild(newCancel, modalCancel);
    modalConfirm.parentNode.replaceChild(newConfirm, modalConfirm);
    hookWithBtn.parentNode.replaceChild(newHookWith, hookWithBtn);
    hookWithoutBtn.parentNode.replaceChild(newHookWithout, hookWithoutBtn);
    
    // Add fresh event listeners
    newCancel.addEventListener('click', handleCancel);
    newConfirm.addEventListener('click', handleConfirm);
    newHookWith.addEventListener('click', handleHookWith);
    newHookWithout.addEventListener('click', handleHookWithout);
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
 * Fetch records for a specific date (one doc per product/category/date/hookType)
 */
async function fetchRecordsByDate(date, category = null) {
  const rows = [];
  try {
    let query = db.collection('sales').where('date', '==', date);
    
    // Filter by category if provided
    if (category) {
      query = query.where('category', '==', category.toLowerCase());
    }
    
    const snapshot = await query.get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data?.item || !data?.quantity) return;
      
      let displayName = String(data.item);
      if (data.hookType) {
        const hookLabel = data.hookType === 'hook' ? 'Hook' : 'No Hook';
        displayName = `${data.item} (${hookLabel})`;
      }
      
      rows.push({
        id: doc.id,
        productName: displayName,
        item: String(data.item),
        category: data.category,
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
  const summaryDailyTotal = document.getElementById('summary-daily-total');
  const refreshButton = document.getElementById('summary-refresh');
  const recordsCategoryButtons = document.querySelectorAll('#summary-section .category-pill-button');

  let selectedDate = getLocalDate();
  let selectedCategory = 'books'; // Default to books
  dateInput.value = selectedDate;

  // Set default category to Books
  const defaultBooksBtn = document.querySelector('#summary-section [data-category="books"]');
  if (defaultBooksBtn) {
    defaultBooksBtn.classList.add('active');
    const container = defaultBooksBtn.closest('.category-pill-container');
    if (container) {
      updatePillSlider(container);
    }
  }

  // Handle category selection
  recordsCategoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      recordsCategoryButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      
      // Update pill slider animation
      const container = button.closest('.category-pill-container');
      if (container) {
        updatePillSlider(container);
      }
      
      selectedCategory = button.getAttribute('data-category').toLowerCase();
      loadRecords();
    });
  });

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
      const rows = await fetchRecordsByDate(selectedDate, selectedCategory);
      
      // Fetch price map for the category
      const pricesMap = await fetchPricesMapForRecords(selectedCategory);
      
      renderRows(rows, pricesMap);
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
      summaryDailyTotal.textContent = '₹0';
    } finally {
      recordsState.isLoading = false;
      refreshButton.classList.remove('loading');
      refreshButton.disabled = false;
    }
  }

  /**
   * Fetch latest price map for a category
   */
  async function fetchPricesMapForRecords(category) {
    const collectionName = category === 'books' ? 'product_prices_books' : 'product_prices_photos';
    try {
      const snapshot = await db.collection(collectionName).get();
      const map = buildLatestPriceMap(snapshot.docs);
      return map;
    } catch (err) {
      console.error('Error fetching prices:', err);
      return {};
    }
  }

  function renderRows(rows, pricesMap) {
    const role = getUserRole();
    summaryBody.innerHTML = '';

    if (!rows || rows.length === 0) {
      summaryBody.innerHTML = '<div class="sheet-empty">No sales for this date.</div>';
      summaryCount.textContent = 'Products: 0';
      summaryDailyTotal.textContent = '₹0';
      return;
    }

    let dailyTotal = 0;

    rows.forEach(({ id, productName, item, total }) => {
      const priceInfo = pricesMap && pricesMap[item];
      const price = priceInfo && priceInfo.price !== undefined ? Number(priceInfo.price) : null;
      const revenue = price !== null ? price * total : 0;
      
      dailyTotal += revenue;
      
      const row = document.createElement('div');
      row.className = 'summary-row';
      row.innerHTML = `
        <div class="summary-cell-item" title="${productName}">${productName}</div>
        <div class="summary-cell-qty">
          <span class="sheet-qty-badge">${total}</span>
        </div>
        <div class="summary-cell-revenue">
          ${price !== null ? `₹${Math.round(revenue).toLocaleString('en-IN')}` : '-'}
          ${role === 'admin' ? '<button class="row-delete-btn" aria-label="Delete record">×</button>' : ''}
        </div>
      `;

      if (role === 'admin') {
        const deleteBtn = row.querySelector('.row-delete-btn');
        deleteBtn.addEventListener('click', async () => {
          showDeleteRecordModal(id, productName, total);
        });
      }

      summaryBody.appendChild(row);
    });

    summaryCount.textContent = `Products: ${rows.length}`;
    const formattedTotal = `₹${Math.round(dailyTotal).toLocaleString('en-IN')}`;
    summaryDailyTotal.textContent = formattedTotal;
    
    // Update the top revenue display as well
    const topRevenueDisplay = document.getElementById('summary-daily-total-top');
    if (topRevenueDisplay) {
      topRevenueDisplay.textContent = formattedTotal;
    }
  }

  /**
   * Show delete record modal
   */
  function showDeleteRecordModal(docId, productName, currentQty) {
    const modal = document.getElementById('delete-record-modal');
    const productLabel = document.getElementById('delete-modal-product');
    const qtyLabel = document.getElementById('delete-modal-qty');
    const reduceBtn = document.getElementById('delete-modal-reduce');
    const deleteBtn = document.getElementById('delete-modal-delete');
    const cancelBtn = document.getElementById('delete-modal-cancel');

    productLabel.textContent = productName;
    qtyLabel.textContent = currentQty;

    const handleReduce = async () => {
      try {
        const recordRef = db.collection('sales').doc(docId);
        const recordDoc = await recordRef.get();
        if (recordDoc.exists) {
          const qty = recordDoc.data().quantity || 1;
          if (qty > 1) {
            await recordRef.update({ quantity: qty - 1 });
          } else {
            await recordRef.delete();
          }
        }
        await loadRecords();
        showToast('Quantity reduced', 'success');
        modal.classList.add('hidden');
      } catch (error) {
        console.error('Reduce failed', error);
        showToast('Failed to reduce quantity', 'error');
      }
    };

    const handleDelete = async () => {
      try {
        await db.collection('sales').doc(docId).delete();
        await loadRecords();
        showToast('Entry deleted', 'success');
        modal.classList.add('hidden');
      } catch (error) {
        console.error('Delete failed', error);
        showToast('Failed to delete entry', 'error');
      }
    };

    const handleCancel = () => {
      modal.classList.add('hidden');
    };

    // Replace listeners
    const newReduce = reduceBtn.cloneNode(true);
    const newDelete = deleteBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    
    reduceBtn.parentNode.replaceChild(newReduce, reduceBtn);
    deleteBtn.parentNode.replaceChild(newDelete, deleteBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newReduce.addEventListener('click', handleReduce);
    newDelete.addEventListener('click', handleDelete);
    newCancel.addEventListener('click', handleCancel);

    modal.classList.remove('hidden');
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
  const categoryButtons = document.querySelectorAll('#monthly-section .category-pill-button');
  const tableContainer = document.getElementById('monthly-table-container');
  const viewToggleBtn = document.getElementById('monthly-view-toggle');
  const toggleLabel = viewToggleBtn?.querySelector('.toggle-label');
  
  let selectedMonth = getLocalDate().substring(0, 7); // YYYY-MM
  let selectedCategory = 'books'; // Default to books
  let monthData = {}; // Store current month's sales data for use in modals
  let isExpandedView = false; // Default to default view (product, prev, sales, remaining, revenue, variance)
  
  // Set default month
  monthInput.value = selectedMonth;
  
  // Set default category to Books
  const defaultBooksBtn = document.querySelector('#monthly-section [data-category="books"]');
  if (defaultBooksBtn) {
    defaultBooksBtn.classList.add('active');
    const container = defaultBooksBtn.closest('.category-pill-container');
    if (container) {
      updatePillSlider(container);
    }
  }
  
  // Handle view toggle
  if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', () => {
      isExpandedView = !isExpandedView;
      toggleLabel.textContent = isExpandedView ? 'Default View' : 'Expanded View';
      loadMonthlyData();
    });
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
      
      // Update pill slider animation
      const container = button.closest('.category-pill-container');
      if (container) {
        updatePillSlider(container);
      }
      
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
   * Fetch monthly data for category
   * 
   * @param {string} category - "books" or "photos"
   * @param {string} yearMonth - "YYYY-MM" format (e.g., "2026-01")
   * @returns {Object} { monthData (product -> date -> qty), products (sorted array) }
   * 
   * NOTE: Date filtering uses string comparison with "YYYY-MM-DD" format.
   * This works correctly for ISO 8601 - all dates in system must maintain this format.
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
      const productsWithSales = new Set();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.date;
        
        // Filter by month in JavaScript
        if (date >= monthStart && date <= monthEnd) {
          const item = data.item;
          const quantity = data.quantity || 1;
          
          productsWithSales.add(item);
          
          if (!monthData[item]) {
            monthData[item] = {};
          }
          if (!monthData[item][date]) {
            monthData[item][date] = 0;
          }
          monthData[item][date] += Number(quantity || 1);
        }
      });
      
      // Get all products from the category list and add those with no sales
      const allProducts = category === 'books' ? BOOKS_LIST : PHOTOS_LIST;
      const allProductsSet = new Set(allProducts.map(p => p.toLowerCase()));
      
      allProductsSet.forEach(product => {
        if (!monthData[product]) {
          monthData[product] = {};
        }
      });
      
      return { monthData, products: sortProductsByList(allProducts, category) };
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      throw error;
    }
  }
  
  /**
   * Get all dates in the month
   * 
   * NOTE: Returns dates in "YYYY-MM-DD" format (ISO 8601).
   * This format is required for string comparison with date filtering throughout the app.
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
   * 
   * NOTE: Date filtering uses timestamp comparison - selects prices effective by month end.
   * Timestamp must be in milliseconds (Firestore .toMillis() format).
   */
  async function fetchPricesForMonth(category, yearMonth) {
    const collectionName = category === 'books' ? 'product_prices_books' : 'product_prices_photos';
    const [year, month] = yearMonth.split('-').map(s => Number(s));
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();
    try {
      const snapshot = await db.collection(collectionName).get();
      const docs = snapshot.docs.filter(doc => {
        const data = doc.data();
        if (!data || !data.product) return false;
        const ts = data.updatedAt && data.updatedAt.toMillis ? data.updatedAt.toMillis() : (data.updatedAt ? new Date(data.updatedAt).getTime() : 0);
        return ts <= monthEnd;
      });
      const map = buildLatestPriceMap(docs);
      return map;
    } catch (err) {
      console.error('Error fetching prices for month:', err);
      return {};
    }
  }

  /**
   * Render monthly table with expanded/compact views, previous/remaining, variance and revenue
   */
  async function renderMonthlyTable(monthData, products, dates, monthRecordsMap, pricesMap, isExpanded = false) {
    if (!products || products.length === 0) {
      tableContainer.innerHTML = `
        <div class="sheet-empty">
          <p>No sales data for this month</p>
        </div>
      `;
      return;
    }

    // Build header based on view mode
    let html = '<div class="monthly-table-wrapper"><table class="monthly-table"><thead><tr>';
    html += '<th class="monthly-cell monthly-cell-product">Product</th>';

    if (isExpanded) {
      // Expanded view: Product, Daily columns, Total Sales
      dates.forEach(date => {
        const day = new Date(date).getDate();
        html += `<th class="monthly-cell monthly-cell-date">${day}</th>`;
      });
      html += '<th class="monthly-cell monthly-cell-total">Total Sales</th>';
    } else {
      // Default view: Product, Previous, Total Sales, Remaining, Revenue, Variance
      html += '<th class="monthly-cell monthly-cell-prev">Previous</th>';
      html += '<th class="monthly-cell monthly-cell-total">Total Sales</th>';
      html += '<th class="monthly-cell monthly-cell-remaining">Remaining</th>';
      html += '<th class="monthly-cell monthly-cell-revenue">Revenue</th>';
      html += '<th class="monthly-cell monthly-cell-variance">Variance</th>';
    }
    html += '</tr></thead><tbody>';

    // Rows
    products.forEach(product => {
      html += '<tr>';
      html += `<td class="monthly-cell monthly-cell-product" title="${product}">${product}</td>`;

      let productTotal = 0;
      
      if (isExpanded) {
        // Expanded view: show daily columns
        dates.forEach(date => {
          const qty = monthData[product] && monthData[product][date] ? monthData[product][date] : 0;
          html += `<td class="monthly-cell monthly-cell-date-qty">${qty}</td>`;
          productTotal += qty;
        });
        html += `<td class="monthly-cell monthly-cell-total"><strong>${productTotal}</strong></td>`;
      } else {
        // Default view: show accounting columns
        dates.forEach(date => {
          const qty = monthData[product] && monthData[product][date] ? monthData[product][date] : 0;
          productTotal += qty;
        });

        // placeholders for the accounting columns (filled after)
        html += `<td class="monthly-cell monthly-cell-prev" data-product="${product}">-</td>`;
        html += `<td class="monthly-cell monthly-cell-total"><strong>${productTotal}</strong></td>`;
        html += `<td class="monthly-cell monthly-cell-remaining" data-product="${product}">-</td>`;
        html += `<td class="monthly-cell monthly-cell-revenue" data-product="${product}">-</td>`;
        html += `<td class="monthly-cell monthly-cell-variance" data-product="${product}"><span class="editable-cell" data-type="variance" style="cursor: pointer;">-</span></td>`;
      }

      html += '</tr>';
    });

    html += '</tbody></table></div>';
    tableContainer.innerHTML = html;

    // Only populate accounting columns in default view
    if (!isExpanded) {
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
        
        // Variance cell with color coding
        if (rowVariance) {
          let varianceClass = '';
          let varianceLabel = '';
          if (variance !== null) {
            if (variance > 0) {
              varianceClass = 'variance-positive';
              varianceLabel = ' more';
            } else if (variance < 0) {
              varianceClass = 'variance-negative';
              varianceLabel = ' less';
            } else {
              varianceClass = 'variance-neutral';
            }
            rowVariance.innerHTML = `<span class="editable-cell variance-cell ${varianceClass}" data-product="${product}" data-type="variance" style="cursor: pointer;">${variance}${varianceLabel}</span>`;
          } else {
            rowVariance.innerHTML = `<span class="editable-cell variance-cell variance-neutral" data-product="${product}" data-type="variance" style="cursor: pointer;">-</span>`;
          }
        }

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
    const lessBtn = document.getElementById('variance-less-btn');
    const noneBtn = document.getElementById('variance-none-btn');
    const moreBtn = document.getElementById('variance-more-btn');
    const cancel = document.getElementById('variance-modal-cancel');
    const save = document.getElementById('variance-modal-save');

    let varianceType = 'none'; // 'less', 'none', 'more' - controls the color
    
    productLabel.textContent = product;
    
    // Load current value and set button state
    fetchMonthlyRecord(category, product, selectedMonth).then(rec => {
      if (rec && rec.variance !== undefined && rec.variance !== null) {
        const value = rec.variance;
        input.value = Math.abs(value);
        
        if (value < 0) {
          varianceType = 'less';
        } else if (value > 0) {
          varianceType = 'more';
        } else {
          varianceType = 'none';
        }
      } else {
        input.value = '';
        varianceType = 'none';
      }
      updateButtonStates();
    });

    function updateButtonStates() {
      lessBtn.classList.remove('active');
      noneBtn.classList.remove('active');
      moreBtn.classList.remove('active');
      
      if (varianceType === 'less') {
        lessBtn.classList.add('active');
      } else if (varianceType === 'more') {
        moreBtn.classList.add('active');
      } else {
        noneBtn.classList.add('active');
      }
    }

    // Button click handlers - only change type, not the number
    const handleLessClick = () => {
      varianceType = varianceType === 'less' ? 'none' : 'less';
      updateButtonStates();
    };

    const handleNoneClick = () => {
      varianceType = 'none';
      updateButtonStates();
    };

    const handleMoreClick = () => {
      varianceType = varianceType === 'more' ? 'none' : 'more';
      updateButtonStates();
    };

    const handleCancel = () => modal.classList.add('hidden');

    const handleSave = async () => {
      const numberValue = input.value === '' ? null : Number(input.value);
      
      if (numberValue !== null && (isNaN(numberValue) || numberValue < 0)) {
        showToast('Please enter a valid positive number', 'error');
        return;
      }

      // Apply sign based on button selection
      let finalValue = null;
      if (numberValue !== null) {
        if (varianceType === 'less') {
          finalValue = -Math.abs(numberValue);
        } else if (varianceType === 'more') {
          finalValue = Math.abs(numberValue);
        } else {
          finalValue = null; // none = neutral
        }
      }

      save.disabled = true;
      save.textContent = 'Saving...';
      try {
        await updateMonthlyRecord(category, product, selectedMonth, { variance: finalValue });
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
    const newInput = input.cloneNode(true);
    const newLess = lessBtn.cloneNode(true);
    const newNone = noneBtn.cloneNode(true);
    const newMore = moreBtn.cloneNode(true);
    const newCancel = cancel.cloneNode(true);
    const newSave = save.cloneNode(true);
    
    input.parentNode.replaceChild(newInput, input);
    lessBtn.parentNode.replaceChild(newLess, lessBtn);
    noneBtn.parentNode.replaceChild(newNone, noneBtn);
    moreBtn.parentNode.replaceChild(newMore, moreBtn);
    cancel.parentNode.replaceChild(newCancel, cancel);
    save.parentNode.replaceChild(newSave, save);
    
    newLess.addEventListener('click', handleLessClick);
    newNone.addEventListener('click', handleNoneClick);
    newMore.addEventListener('click', handleMoreClick);
    newCancel.addEventListener('click', handleCancel);
    newSave.addEventListener('click', handleSave);

    setTimeout(() => newInput.focus(), 100);
    modal.classList.remove('hidden');
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

      await renderMonthlyTable(monthData, products, dates, monthRecordsMap, pricesMap, isExpandedView);
      
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
// Cashflow Tracking
// ============================================================================

/**
 * Initialize Cashflow page
 */
function initCashflow() {
  const monthInput = document.getElementById('cashflow-month-input');
  const balanceDisplay = document.getElementById('cashflow-balance');
  const cashflowBody = document.getElementById('cashflow-body');
  const refreshButton = document.getElementById('cashflow-refresh');
  
  // Modal elements
  const addModal = document.getElementById('cashflow-add-modal');
  const withdrawModal = document.getElementById('cashflow-withdraw-modal');
  const addBtn = document.getElementById('cashflow-add-transaction');
  const withdrawBtn = document.getElementById('cashflow-remove-transaction');
  const addRevenueBtn = document.getElementById('cashflow-add-revenue');
  
  let selectedMonth = getLocalDate().substring(0, 7); // YYYY-MM
  monthInput.value = selectedMonth;
  
  let cashflowState = {
    isLoading: false,
    loadCashflow: null
  };

  /**
   * Fetch all cashflow transactions for a given month
   * 
   * @param {string} yearMonth - "YYYY-MM" format (e.g., "2026-01")
   * @returns {Array} Array of transactions sorted by date
   * 
   * NOTE: Date filtering uses string comparison with "YYYY-MM-DD" format.
   * This works correctly for ISO 8601 - all dates in system must maintain this format.
   */
  async function fetchCashflowForMonth(yearMonth) {
    const [year, month] = yearMonth.split('-');
    const monthStart = `${year}-${month}-01`;
    const monthEnd = `${year}-${month}-31`;
    
    try {
      const snapshot = await db.collection('cashflow').get();
      const transactions = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.date;
        
        if (date >= monthStart && date <= monthEnd) {
          transactions.push({
            id: doc.id,
            date: data.date,
            type: data.type, // 'revenue', 'cash', 'overflow', 'withdrawal'
            amount: Number(data.amount || 0),
            reason: data.reason || '',
            createdAt: data.createdAt
          });
        }
      });
      
      // Sort by date ascending for running balance calculation
      return transactions.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error fetching cashflow:', error);
      throw error;
    }
  }

  /**
   * Calculate running balance for transactions
   */
  function calculateRunningBalance(transactions) {
    let balance = 0;
    return transactions.map(t => {
      if (t.type === 'withdrawal') {
        balance -= t.amount;
      } else {
        balance += t.amount;
      }
      return {
        ...t,
        runningBalance: balance
      };
    });
  }

  /**
   * Calculate monthly revenue from sales
   * 
   * @param {string} yearMonth - "YYYY-MM" format (e.g., "2026-01")
   * @returns {number} Total revenue = sum of (quantity × latest price) for all sales in month
   * 
   * NOTE: Date filtering uses string comparison with "YYYY-MM-DD" format.
   * This works correctly for ISO 8601 - all dates in system must maintain this format.
   */
  async function calculateMonthlyRevenue(yearMonth) {
    const [year, month] = yearMonth.split('-');
    const monthStart = `${year}-${month}-01`;
    const monthEnd = `${year}-${month}-31`;
    
    try {
      const snapshot = await db.collection('sales').get();
      let totalRevenue = 0;
      
      // Get all books prices
      const booksPricesSnapshot = await db.collection('product_prices_books').get();
      const booksLatestPrices = {};
      booksPricesSnapshot.forEach(doc => {
        const data = doc.data();
        const product = data.product;
        const ts = data.updatedAt && data.updatedAt.toMillis ? data.updatedAt.toMillis() : 0;
        if (!booksLatestPrices[product] || ts > booksLatestPrices[product].time) {
          booksLatestPrices[product] = { price: data.price, time: ts };
        }
      });
      
      // Get all photos prices
      const photosPricesSnapshot = await db.collection('product_prices_photos').get();
      const photosLatestPrices = {};
      photosPricesSnapshot.forEach(doc => {
        const data = doc.data();
        const product = data.product;
        const ts = data.updatedAt && data.updatedAt.toMillis ? data.updatedAt.toMillis() : 0;
        if (!photosLatestPrices[product] || ts > photosLatestPrices[product].time) {
          photosLatestPrices[product] = { price: data.price, time: ts };
        }
      });
      
      // Calculate revenue for sales in this month
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.date;
        
        if (date >= monthStart && date <= monthEnd) {
          const item = data.item;
          const quantity = Number(data.quantity || 0);
          const category = data.category;
          
          let price = null;
          if (category === 'books') {
            price = booksLatestPrices[item]?.price;
          } else if (category === 'photos') {
            price = photosLatestPrices[item]?.price;
          }
          
          if (price !== null && quantity > 0) {
            totalRevenue += Number(price) * quantity;
          }
        }
      });
      
      return totalRevenue;
    } catch (error) {
      console.error('Error calculating revenue:', error);
      return 0;
    }
  }

  /**
   * Check if revenue transaction already exists for this month
   */
  async function hasRevenueTransaction(yearMonth) {
    try {
      const snapshot = await db.collection('cashflow')
        .where('type', '==', 'revenue')
        .where('reason', '==', yearMonth)
        .limit(1)
        .get();
      
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking revenue transaction:', error);
      return false;
    }
  }

  /**
   * Add revenue transaction to cashflow
   */
  async function addRevenueTransaction(yearMonth, amount) {
    try {
      const [year, month] = yearMonth.split('-');
      const monthStart = `${year}-${month}-01`;
      
      // Check if revenue already added for this month
      const exists = await hasRevenueTransaction(yearMonth);
      if (exists) {
        showToast('Revenue already added for this month', 'info');
        return;
      }
      
      await db.collection('cashflow').add({
        date: monthStart,
        type: 'revenue',
        amount: Number(amount),
        reason: yearMonth, // Use month as identifier
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      showToast(`Revenue ₹${Math.round(amount)} added automatically`, 'success');
    } catch (error) {
      console.error('Error adding revenue transaction:', error);
      showToast('Failed to add revenue', 'error');
    }
  }

  /**
   * Add cash or overflow transaction
   */
  async function addCashTransaction(date, amount, type, reason) {
    try {
      await db.collection('cashflow').add({
        date: date,
        type: type, // 'cash' or 'overflow'
        amount: Number(amount),
        reason: reason,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      showToast(`Cash added: ₹${Math.round(amount)}`, 'success');
    } catch (error) {
      console.error('Error adding cash transaction:', error);
      showToast('Failed to add cash', 'error');
      throw error;
    }
  }

  /**
   * Add withdrawal transaction
   */
  async function addWithdrawalTransaction(date, amount, reason) {
    try {
      await db.collection('cashflow').add({
        date: date,
        type: 'withdrawal',
        amount: Number(amount),
        reason: reason,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      showToast(`Withdrawal: ₹${Math.round(amount)}`, 'success');
    } catch (error) {
      console.error('Error adding withdrawal transaction:', error);
      showToast('Failed to record withdrawal', 'error');
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  async function deleteTransaction(transactionId) {
    try {
      await db.collection('cashflow').doc(transactionId).delete();
      showToast('Transaction deleted', 'success');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showToast('Failed to delete transaction', 'error');
      throw error;
    }
  }

  /**
   * Save cash count (notes + coins)
   */
  async function saveCashCount(date, notes, coins) {
    const total = Number(notes) + Number(coins);
    try {
      await db.collection('cash_counts').doc(date).set({
        date: date,
        notes: Number(notes),
        coins: Number(coins),
        total: total,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      showToast(`Cash count saved: ₹${Math.round(total)}`, 'success');
    } catch (error) {
      console.error('Error saving cash count:', error);
      showToast('Failed to save cash count', 'error');
      throw error;
    }
  }

  /**
   * Fetch cash counts for a month
   */
  async function fetchCashCountsForMonth(yearMonth) {
    const [year, month] = yearMonth.split('-');
    const monthStart = `${year}-${month}-01`;
    const monthEnd = `${year}-${month}-31`;
    
    try {
      const snapshot = await db.collection('cash_counts')
        .where('date', '>=', monthStart)
        .where('date', '<=', monthEnd)
        .orderBy('date', 'desc')
        .get();
      
      const counts = [];
      snapshot.forEach(doc => {
        counts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return counts;
    } catch (error) {
      console.error('Error fetching cash counts:', error);
      return [];
    }
  }

  /**
   * Load and display cashflow for selected month
   */
  async function loadCashflow() {
    if (cashflowState.isLoading) return;
    
    cashflowState.isLoading = true;
    refreshButton.classList.add('loading');
    refreshButton.disabled = true;
    
    cashflowBody.innerHTML = `
      <div class="sheet-loading">
        <div class="spinner"></div>
        <span>Loading cashflow...</span>
      </div>
    `;
    
    try {
      const transactions = await fetchCashflowForMonth(selectedMonth);
      const cashCounts = await fetchCashCountsForMonth(selectedMonth);
      const withBalances = calculateRunningBalance(transactions);
      
      // Get current balance (last transaction's running balance or 0)
      const currentBalance = withBalances.length > 0 
        ? withBalances[withBalances.length - 1].runningBalance 
        : 0;
      
      balanceDisplay.textContent = `₹${Math.round(currentBalance).toLocaleString('en-IN')}`;
      
      renderCashflowRows(withBalances, cashCounts);
    } catch (error) {
      console.error('Failed to load cashflow', error);
      cashflowBody.innerHTML = `
        <div class="sheet-error">
          <div class="sheet-error-title">Error</div>
          <div class="sheet-error-message">Failed to load cashflow</div>
        </div>
      `;
    } finally {
      cashflowState.isLoading = false;
      refreshButton.classList.remove('loading');
      refreshButton.disabled = false;
    }
  }

  /**
   * Render cashflow transactions
   */
  function renderCashflowRows(transactions, cashCounts = []) {
    const role = getUserRole();
    
    if (!transactions || transactions.length === 0) {
      cashflowBody.innerHTML = '<div class="sheet-empty">No transactions for this month.</div>';
      return;
    }
    
    cashflowBody.innerHTML = '';
    
    transactions.forEach(t => {
      const row = document.createElement('div');
      row.className = 'cashflow-row';
      row.setAttribute('data-type', t.type); // Add data-type for color coding
      
      const date = new Date(t.date);
      const dateStr = date.toLocaleDateString('en-IN');
      
      const typeLabel = {
        'revenue': '📈 Revenue',
        'cash': '� Cash',
        'overflow': '↗️ Overflow',
        'withdrawal': '🏦 Withdrawal'
      }[t.type] || t.type;
      
      const amountClass = t.type === 'withdrawal' ? 'cashflow-amount-neg' : 'cashflow-amount-pos';
      const amount = t.type === 'withdrawal' ? -t.amount : t.amount;
      
      row.innerHTML = `
        <div class="cashflow-cell cashflow-col-date">${dateStr}</div>
        <div class="cashflow-cell cashflow-col-type">${typeLabel}</div>
        <div class="cashflow-cell cashflow-col-amount ${amountClass}">₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}</div>
        <div class="cashflow-cell cashflow-col-balance">₹${Math.round(t.runningBalance).toLocaleString('en-IN')}</div>
        <div class="cashflow-cell cashflow-col-note" title="${t.reason}">${t.reason || '-'}</div>
        ${role === 'admin' ? '<button class="cashflow-delete-btn" aria-label="Delete transaction">×</button>' : ''}
      `;
      
      if (role === 'admin') {
        const deleteBtn = row.querySelector('.cashflow-delete-btn');
        deleteBtn.addEventListener('click', async () => {
          const confirmed = window.confirm(`Delete ${typeLabel} of ₹${Math.round(Math.abs(amount))}?`);
          if (!confirmed) return;
          try {
            await deleteTransaction(t.id);
            await loadCashflow();
          } catch (error) {
            console.error('Delete failed', error);
          }
        });
      }
      
      cashflowBody.appendChild(row);
    });

    // Add Cash Count records
    if (cashCounts && cashCounts.length > 0) {
      // Add a divider
      const divider = document.createElement('div');
      divider.className = 'cashflow-divider';
      divider.innerHTML = '<span>📋 Physical Cash Counts</span>';
      cashflowBody.appendChild(divider);

      // Render cash counts
      cashCounts.forEach(cc => {
        const row = document.createElement('div');
        row.className = 'cashflow-row cashflow-cash-count-row';
        row.setAttribute('data-type', 'cash-count');
        
        const date = new Date(cc.date);
        const dateStr = date.toLocaleDateString('en-IN');
        
        row.innerHTML = `
          <div class="cashflow-cell cashflow-col-date">${dateStr}</div>
          <div class="cashflow-cell cashflow-col-type">💰 Cash Count</div>
          <div class="cashflow-cell cashflow-col-amount">
            <div class="cash-count-breakdown">
              <span class="cash-count-item"><span class="cash-label">Notes:</span> ₹${Math.round(cc.notes).toLocaleString('en-IN')}</span>
              <span class="cash-count-item"><span class="cash-label">Coins:</span> ₹${Math.round(cc.coins).toLocaleString('en-IN')}</span>
            </div>
            <div class="cash-count-total">₹${Math.round(cc.total).toLocaleString('en-IN')}</div>
          </div>
          <div class="cashflow-cell cashflow-col-balance">-</div>
          <div class="cashflow-cell cashflow-col-note">Physical count</div>
          ${role === 'admin' ? `<div class="cashflow-cell-actions"><button class="cashflow-edit-btn" aria-label="Edit cash count">✎</button><button class="cashflow-delete-cc-btn" aria-label="Delete cash count">×</button></div>` : ''}
        `;
        
        if (role === 'admin') {
          const editBtn = row.querySelector('.cashflow-edit-btn');
          const deleteBtn = row.querySelector('.cashflow-delete-cc-btn');
          
          editBtn.addEventListener('click', async () => {
            showCashCountModal(cc.date);
          });
          
          deleteBtn.addEventListener('click', async () => {
            const confirmed = window.confirm(`Delete cash count for ${dateStr}?`);
            if (!confirmed) return;
            try {
              await db.collection('cash_counts').doc(cc.date).delete();
              showToast('Cash count deleted', 'success');
              await loadCashflow();
            } catch (error) {
              console.error('Delete failed', error);
              showToast('Failed to delete', 'error');
            }
          });
        }
        
        cashflowBody.appendChild(row);
      });
    }
  }

  /**
   * Show Add Cash Modal
   */
  function showAddCashModal() {
    const dateInput = document.getElementById('cashflow-add-date');
    const amountInput = document.getElementById('cashflow-add-amount');
    const typeSelect = document.getElementById('cashflow-add-type');
    const reasonInput = document.getElementById('cashflow-add-reason');
    const cancelBtn = document.getElementById('cashflow-add-cancel');
    const confirmBtn = document.getElementById('cashflow-add-confirm');
    
    // Set default date
    dateInput.value = getLocalDate();
    amountInput.value = '';
    typeSelect.value = 'cash';
    reasonInput.value = '';
    
    addModal.classList.remove('hidden');
    setTimeout(() => amountInput.focus(), 100);
    
    const handleCancel = () => {
      addModal.classList.add('hidden');
    };
    
    const handleConfirm = async () => {
      const date = dateInput.value;
      const amount = Number(amountInput.value);
      const type = typeSelect.value;
      const reason = reasonInput.value.trim();
      
      if (!date || isNaN(amount) || amount <= 0) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Adding...';
      
      try {
        await addCashTransaction(date, amount, type, reason);
        addModal.classList.add('hidden');
        await loadCashflow();
      } catch (error) {
        console.error('Add cash error:', error);
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Add';
      }
    };
    
    // Replace listeners
    const newCancel = cancelBtn.cloneNode(true);
    const newConfirm = confirmBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    newCancel.addEventListener('click', handleCancel);
    newConfirm.addEventListener('click', handleConfirm);
    
    // Close on backdrop click
    addModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        handleCancel();
      }
    });
  }

  /**
   * Show Withdraw Modal
   */
  function showWithdrawModal() {
    const dateInput = document.getElementById('cashflow-withdraw-date');
    const amountInput = document.getElementById('cashflow-withdraw-amount');
    const reasonInput = document.getElementById('cashflow-withdraw-reason');
    const cancelBtn = document.getElementById('cashflow-withdraw-cancel');
    const confirmBtn = document.getElementById('cashflow-withdraw-confirm');
    
    // Set default date
    dateInput.value = getLocalDate();
    amountInput.value = '';
    reasonInput.value = '';
    
    withdrawModal.classList.remove('hidden');
    setTimeout(() => amountInput.focus(), 100);
    
    const handleCancel = () => {
      withdrawModal.classList.add('hidden');
    };
    
    const handleConfirm = async () => {
      const date = dateInput.value;
      const amount = Number(amountInput.value);
      const reason = reasonInput.value.trim();
      
      if (!date || isNaN(amount) || amount <= 0) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      
      if (!reason) {
        showToast('Reason is mandatory for withdrawals', 'error');
        return;
      }
      
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Withdrawing...';
      
      try {
        await addWithdrawalTransaction(date, amount, reason);
        withdrawModal.classList.add('hidden');
        await loadCashflow();
      } catch (error) {
        console.error('Withdraw error:', error);
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Withdraw';
      }
    };
    
    // Replace listeners
    const newCancel = cancelBtn.cloneNode(true);
    const newConfirm = confirmBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    newCancel.addEventListener('click', handleCancel);
    newConfirm.addEventListener('click', handleConfirm);
    
    // Close on backdrop click
    withdrawModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        handleCancel();
      }
    });
  }

  /**
   * Handle Add Revenue button
   */
  async function handleAddRevenue() {
    try {
      const monthRevenue = await calculateMonthlyRevenue(selectedMonth);
      
      if (monthRevenue === 0) {
        showToast('No sales revenue for this month', 'info');
        return;
      }
      
      await addRevenueTransaction(selectedMonth, monthRevenue);
      await loadCashflow();
    } catch (error) {
      console.error('Error handling add revenue:', error);
    }
  }

  /**
   * Show Cash Count Modal
   * @param {string} editDate - Optional date to edit existing cash count
   */
  function showCashCountModal(editDate = null) {
    const modal = document.getElementById('cashflow-cash-count-modal');
    const dateInput = document.getElementById('cash-count-date');
    const notesInput = document.getElementById('cash-count-notes');
    const coinsInput = document.getElementById('cash-count-coins');
    const totalDisplay = document.getElementById('cash-count-total-value');
    const cancelBtn = document.getElementById('cash-count-cancel');
    const confirmBtn = document.getElementById('cash-count-confirm');
    
    // Set default or edit date
    const dateToUse = editDate || getLocalDate();
    dateInput.value = dateToUse;
    dateInput.disabled = editDate ? true : false; // Disable date editing when editing existing record
    notesInput.value = '';
    coinsInput.value = '';
    totalDisplay.textContent = '0';
    
    // Load existing data if available
    db.collection('cash_counts').doc(dateToUse).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        notesInput.value = data.notes || '';
        coinsInput.value = data.coins || '';
        updateCashCountTotal();
      }
    });
    
    modal.classList.remove('hidden');
    setTimeout(() => notesInput.focus(), 100);
    
    // Update total as user types
    const updateCashCountTotal = () => {
      const notes = Number(notesInput.value) || 0;
      const coins = Number(coinsInput.value) || 0;
      totalDisplay.textContent = Math.round(notes + coins).toLocaleString('en-IN');
    };
    
    notesInput.addEventListener('input', updateCashCountTotal);
    coinsInput.addEventListener('input', updateCashCountTotal);
    
    const handleCancel = () => {
      modal.classList.add('hidden');
      dateInput.disabled = false;
    };
    
    const handleConfirm = async () => {
      const date = dateInput.value;
      const notes = notesInput.value;
      const coins = coinsInput.value;
      
      if (!date || notes === '' || coins === '') {
        showToast('Please fill in all fields', 'error');
        return;
      }
      
      const notesNum = Number(notes);
      const coinsNum = Number(coins);
      
      if (isNaN(notesNum) || isNaN(coinsNum) || notesNum < 0 || coinsNum < 0) {
        showToast('Please enter valid amounts', 'error');
        return;
      }
      
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Saving...';
      
      try {
        await saveCashCount(date, notesNum, coinsNum);
        modal.classList.add('hidden');
        dateInput.disabled = false;
        await loadCashflow();
      } catch (error) {
        console.error('Cash count error:', error);
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Save';
      }
    };
    
    // Replace listeners
    const newCancel = cancelBtn.cloneNode(true);
    const newConfirm = confirmBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    newCancel.addEventListener('click', handleCancel);
    newConfirm.addEventListener('click', handleConfirm);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        handleCancel();
      }
    });
  }

  // Event listeners
  monthInput.addEventListener('change', (e) => {
    selectedMonth = e.target.value;
    loadCashflow();
  });

  refreshButton.addEventListener('click', () => loadCashflow());
  
  if (addBtn) {
    addBtn.addEventListener('click', showAddCashModal);
  }
  
  if (withdrawBtn) {
    withdrawBtn.addEventListener('click', showWithdrawModal);
  }
  
  if (addRevenueBtn) {
    addRevenueBtn.addEventListener('click', handleAddRevenue);
  }

  // Cash count button
  const cashCountBtn = document.getElementById('cashflow-cash-count');
  if (cashCountBtn) {
    cashCountBtn.addEventListener('click', showCashCountModal);
  }

  cashflowState.loadCashflow = loadCashflow;
  window.loadCashflow = loadCashflow;

  // Load default data
  loadCashflow();
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
// Pill Slider Helper
// ============================================================================

/**
 * Update the pill slider position based on active button
 */
function updatePillSlider(container) {
  if (!container) return;
  
  const activeButton = container.querySelector('.category-pill-button.active');
  const slider = container.querySelector('.category-pill-slider');
  
  if (!activeButton || !slider) return;
  
  // Get the active button's position within the container
  const containerRect = container.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  
  // Calculate the position relative to container
  const relativeLeft = buttonRect.left - containerRect.left;
  const buttonWidth = buttonRect.width;
  
  // Update slider position
  slider.style.left = relativeLeft + 'px';
  slider.style.width = buttonWidth + 'px';
  
  // Update slider color based on active button
  const activeCategory = activeButton.dataset.category.toLowerCase();
  if (activeCategory === 'books') {
    slider.style.background = 'var(--gradient-purple)';
    slider.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.4)';
  } else if (activeCategory === 'photos') {
    slider.style.background = 'var(--gradient-orange)';
    slider.style.boxShadow = '0 0 20px rgba(249, 115, 22, 0.4)';
  }
}

// ============================================================================
// Touch & Mobile Optimization (Oxygen OS Animations)
// ============================================================================

/**
 * Optimize touch interactions for mobile devices
 */
function initTouchOptimization() {
  // Prevent default touch delay
  document.addEventListener('touchstart', function() {}, { passive: true });
  
  // Add haptic feedback class for better visual feedback on touch
  const interactiveElements = document.querySelectorAll(
    'button, input, select, textarea, .nav-button, .action-button, .modal-button, .product-button'
  );
  
  interactiveElements.forEach(element => {
    element.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    }, { passive: true });
    
    element.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    }, { passive: true });
  });
  
  // Disable hover on touch devices to prevent stuck hover states
  let lastTouchTime = 0;
  document.addEventListener('touchstart', function() {
    lastTouchTime = Date.now();
  }, { passive: true });
  
  // Add media query for reduced motion support
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
  }
}

// ============================================================================
// App Initialization
// ============================================================================

/**
 * Initialize the application
 */
function initApp() {
  // Initialize touch optimization for better mobile experience
  initTouchOptimization();
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

  // Initialize cashflow page
  initCashflow();

  // Initialize price update page
  initPricePage();
  
  // Initialize navigation
  initNavigation();
  
  // Setup logout button
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  // Monitor performance (only in production/testing)
  if (window.performance && performance.timing) {
    window.addEventListener('load', () => {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      console.log(`⚡ Performance: Page Load: ${pageLoadTime}ms, Connect: ${connectTime}ms, Render: ${renderTime}ms`);
    });
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

