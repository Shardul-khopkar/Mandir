# Quick Reference: Sales Tracker Features

## Features Summary

### 1. Price Update Page
- **How to access**: Dashboard → "Update Prices" button
- **What it does**: Manage product prices per category (Books/Photos)
- **Who can use**: Admin and Presenter role (viewers see "Locked")
- **Firebase collections**: `product_prices_books`, `product_prices_photos`
- **Note**: Presenter role (shardul@1) can update prices but cannot access other features

### 2. Monthly Records - Enhanced Table
- **Default view**: Product Name + Daily Sales + Total
- **Toggle view**: Click Product Name column header to switch
- **Expanded view**: Previous Stock + Remaining Stock + Variance + Revenue

### 3. Stock Management
- **Previous Stock**: Opening stock for month (editable via modal)
- **Remaining Stock**: Closing stock at month-end (auto-carries to next month)
- **Carry-forward rule**: Remaining (Month N) → Previous (Month N+1)

### 4. Calculations
- **Variance**: Remaining − (Previous − Total Sales)
- **Revenue**: Total Sales × Product Price
- **Price source**: Latest price effective during the month

## Technical Implementation

### Firebase Collections

```
product_prices_books/
  { product, price, updatedAt }

product_prices_photos/
  { product, price, updatedAt }

monthly_records_books/
  {YYYY-MM}_{product_id}
  { product, month, previousStock, remainingStock, variance, notes, updatedAt }

monthly_records_photos/
  {YYYY-MM}_{product_id}
  { product, month, previousStock, remainingStock, variance, notes, updatedAt }
```

### Key Functions Added

**Price Management**:
- `initPricePage()` - Initialize price page
- `fetchAllPriceDocs(category)` - Get all prices
- `loadPrices()` - Render prices table
- `showPriceModal(category, product, currentInfo)` - Edit price modal

**Monthly Records**:
- `fetchMonthlyRecordsMap(category, yearMonth)` - Get month's records
- `fetchPricesForMonth(category, yearMonth)` - Get prices active during month
- `renderMonthlyTable(monthData, products, dates, monthRecordsMap, pricesMap)` - Render with toggle
- `showPrevStockModal(category, product)` - Edit previous stock
- `showRemainingModal(category, product)` - Edit remaining stock
- `propagateRemainingToNextMonth(category, product, month, remaining)` - Auto carry-forward

## Separation of Concerns

**Books and Photos are completely separate**:
- Different Firebase collections (prices, records)
- Different pages (but same table layout)
- Different price calculations
- No shared modals

**Monthly records are accounting-level**:
- No live stock system interference
- No physical/predicted stock logic
- Simple quantity + optional notes
- Clean, minimal modals

## Usage Example

### Manager's Workflow (Admin)

1. **Set month prices** (once per month):
   - Dashboard → "Update Prices"
   - Select Books (or Photos)
   - Click "Edit" on each product
   - Enter price, confirm

2. **Record month-end adjustments**:
   - Monthly tab → Select Books/Photos and month
   - Click "Edit" on Previous Stock (set opening balance)
   - Daily sales are recorded automatically
   - Click "Edit" on Remaining Stock (set closing balance)

3. **View financials**:
   - Click Product Name header to toggle view
   - See Variance (stock discrepancies)
   - See Revenue (sales value with prices)

## Admin-Only Controls

These features require `admin` role:
- Edit Previous Stock
- Edit Remaining Stock
- Change prices in Price Update page
- Viewers see disabled/locked buttons

## Data Integrity

- **Non-retroactive**: Price changes don't affect historical revenue
- **Historical prices**: All prices stored with timestamps
- **Month-locked**: Revenue uses price effective by month-end
- **Automatic carry-forward**: No manual handoff needed between months
- **Variance tracking**: Helps identify stock count discrepancies

## UI/UX

- **Non-primary button**: "Update Prices" is small and secondary in Dashboard
- **Instant toggle**: Product Name header toggle is fast, reversible
- **Familiar modals**: Stock modals match existing style
- **Clear indicators**: Non-zero variance is highlighted in orange
- **Locked for viewers**: Price editing and stock adjustments disabled for non-admin

## Testing Checklist

- [ ] Price Update page accessible from Dashboard
- [ ] Can add/edit prices (admin only)
- [ ] Prices per product and category
- [ ] Monthly table shows sales by default
- [ ] Click Product Name toggles to accounting view
- [ ] Remaining stock auto-carries to next month
- [ ] Variance calculated correctly
- [ ] Revenue shows with proper price
- [ ] Viewer role sees locked controls
- [ ] Categories separated (no cross-contamination)

## Notes

- Monthly records are stored per month per product
- Previous/Remaining stock are optional (show "-" if not set)
- Revenue shows "-" if price not set
- Toggle state doesn't persist (resets when page reloads)
- All edits are real-time to Firebase
