# Implementation Summary: Monthly Records + Pricing Upgrade

## Completed Features

### 1. Price Update Page
- **Location**: Accessible from Dashboard via "Update Prices" button
- **Access**: Small, non-primary button in Dashboard (not a main nav tab)
- **Features**:
  - Separate price management for Books and Photos
  - Shows current price and last updated timestamp for each product
  - Admin and Presenter role editing (viewers see "Locked")
  - Price changes save to Firebase with timestamp
  - Historical prices preserved (no retroactive revenue changes)
  - **Presenter role**: Can access ONLY this feature, no other app access

**Firebase Collections**:
- `product_prices_books` → `{ product, price, updatedAt }`
- `product_prices_photos` → `{ product, price, updatedAt }`

### 2. Monthly Records Page - New Column Structure

**Sales View** (what users see initially):
- Product Name (clickable header)
- Daily Sales (1 column per date in month)
- Total Sales

**Accounting View** (click Product Name header to toggle):
- Product Name
- Previous Stock
- Remaining Stock
- Variance
- Revenue

**Columns** (in order):
1. Product Name (toggle trigger)
2. Daily Sales columns (dates)
3. Total Sales
4. Previous Stock (hidden by default)
5. Remaining Stock (hidden by default)
6. Variance (hidden by default)
7. Revenue (hidden by default)

### 3. Toggle Behavior

**Clicking Product Name Column Header** toggles between:
- **Sales View**: Product + Daily Sales (1-31) + Total
  - Shows all daily entries for quick reference
  - Good for reviewing daily transaction history
- **Accounting View**: Product + Previous + Remaining + Variance + Revenue
  - Shows month-end accounting summary
  - Good for financial reconciliation and revenue reporting

### 4. Previous Stock Column

- **Definition**: Opening stock for the month
- **Editable**: Via clean modal (admin-only)
- **Modal Style**: Consistent with existing stock modals
- **Fields**: Quantity + Optional Notes
- **No predicted logic**: Simple accounting-level data

### 5. Remaining Stock Column

- **Definition**: Closing stock at month-end (reconciliation)
- **Editable**: Via simple, minimal modal (admin-only)
- **Modal Fields**: Quantity + Optional Notes
- **Carries Forward**: Automatically becomes Previous Stock for next month

**Automatic Carry-Forward Rule**:
```
Remaining Stock (Month N) → Previous Stock (Month N+1)
```
- Happens automatically on save
- Independent for Books and Photos
- No manual action required

### 6. Variance Column

- **Calculated**: Remaining − (Previous − Total)
- **Highlighted**: Orange if non-zero
- **Style**: Neutral if zero
- **No manual input**: Auto-calculated on remaining stock save

### 7. Revenue Column

- **Calculated**: Total Sales × Product Price
- **Price source**: Month-end effective price
- **Separate**: Books and Photos have independent prices
- **Shows "-"**: If no price is set

### 8. Monthly Records Schema

Firebase structure for monthly accounting:

```
monthly_records_books/{YYYY-MM}_{product_id}
  { product, month, previousStock, remainingStock, variance, notes, updatedAt }

monthly_records_photos/{YYYY-MM}_{product_id}
  { product, month, previousStock, remainingStock, variance, notes, updatedAt }
```

### 9. Modal Cleanup

Removed all redundant logic:
- No Current Physical Stock
- No Predicted Stock
- No variance alerts
- No live stock interference
- Clean: Quantity + Optional Notes + Confirm/Cancel

### 10. Separation Rules

- Books and Photos: Separate pages
- Separate Firebase collections: `product_prices_books`, `product_prices_photos`, `monthly_records_books`, `monthly_records_photos`
- Separate prices and revenue calculations
- No shared modals
- No mixed product lists

## Technical Details

### Key Functions Added

**Price Management**:
- `initPricePage()` - Initialize price page
- `fetchAllPriceDocs(category)` - Get all prices
- `loadPrices()` - Render prices table
- `showPriceModal(category, product, currentInfo)` - Edit price modal

**Monthly Records**:
- `fetchMonthlyRecordsMap(category, yearMonth)` - Get month's records
- `fetchPricesForMonth(category, yearMonth)` - Get prices active during month
- `renderMonthlyTable(monthData, products, dates, monthRecordsMap, pricesMap)` - Render 7-column table with toggle
- `showPrevStockModal(category, product)` - Edit previous stock
- `showRemainingModal(category, product)` - Edit remaining stock
- `propagateRemainingToNextMonth(category, product, month, remaining)` - Auto carry-forward

### UI Updates

- **Price Table**: Shows product name, current price, last updated date
- **Monthly Table**: 7 columns with toggle between sales and accounting views
- **Previous/Remaining Modals**: Clean, simple dialogs with quantity and notes fields
- **Variance Highlight**: Orange background if non-zero for quick identification
- **Revenue Display**: Shows as whole numbers (no decimals)

## Data Flow Example

### Monthly Flow (Book Example)

**Day 1 of Month**:
1. Manager sets Previous Stock = 50 books
2. Daily sales recorded (system collects automatically)

**End of Month**:
1. Manager enters Remaining Stock = 40 books
2. System auto-calculates:
   - Total Sales = sum of all daily entries = 15
   - Variance = 40 − (50 − 15) = 40 − 35 = 5 (positive, possible overstock or error)
   - Revenue = 15 × $price = calculated and displayed

**Next Month**:
1. System auto-sets Previous Stock = 40 (from last month's remaining)
2. Manager verifies and can adjust if needed
3. Process repeats

## Important Notes

- **Non-retroactive pricing**: Changing price in Month 2 does NOT affect Month 1 revenue
- **Optional fields**: Previous/Remaining stock not required (shows "-" if empty)
- **Toggle is session-only**: View preference resets on page reload
- **Real-time sync**: All changes sync to Firebase immediately
- **Admin-only**: All stock/price edits require admin role
