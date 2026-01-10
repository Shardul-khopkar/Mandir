# Pustak Stall Entry - Sales Tracker

A modern PWA-based sales and inventory tracking application for managing product sales, pricing, and monthly accounting records.

## Features

### Dashboard
- Quick overview of daily sales by product category
- Visual organization by Books and Photos
- Daily entry system with intuitive interface

### Sales Records
- Complete daily transaction history
- Filter by date range and product category
- Detailed sales analytics

### Monthly Records
- Advanced accounting module with 7-column table
- **Toggle View**: Click product name to switch between:
  - Sales View: Product + Daily Sales (1-31) + Total
  - Accounting View: Previous Stock + Remaining Stock + Variance + Revenue
- Auto carry-forward: Remaining stock from one month becomes next month's opening stock
- Revenue calculations based on actual prices during month

### Price Management
- Set and update product prices for Books and Photos separately
- Admin and Presenter role access with timestamp tracking
- Non-retroactive pricing (future prices don't affect past revenue)
- Complete price history available

### Authentication
- Viewer role (read-only access): `Gopal@23`
- Admin role (full access): `Shardul@1`
- Presenter role (prices only): `shardul@1`
- 7-day auth caching for seamless offline experience

### Progressive Web App (PWA)
- Install as standalone app on mobile and desktop
- Works offline with service worker caching
- One-click installation prompt
- Responsive design with iOS 17 glass UI aesthetic

## Getting Started

1. Open `index.html` in a modern web browser
2. Log in with your credentials
3. Start tracking sales from the Dashboard
4. Access monthly records for accounting needs
5. Manage prices from the Price Update page (admin or presenter role)

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase Firestore
- **Styling**: iOS 17 frosted glass design with dark mode
- **Offline**: Service Worker with intelligent caching
- **No dependencies**: Pure vanilla implementation

## Installation as PWA

1. Open the app in Chrome/Edge on mobile or desktop
2. Look for the "Install" prompt
3. Click "Install" to add to home screen or start menu
4. App works offline and is fully functional as installed app

## PWA Icons & Manifest

The app includes a fully compliant PWA manifest with:
- **192x192 PNG icon** for primary app icon
- **512x512 PNG icon** for app store packaging
- **Screenshots** for narrow and wide form factors
- Unique app ID for proper browser identification

To regenerate icons, open `generate_icons.html` in a browser and download the PNG files to the `icons/` folder.

## Project Structure

```
├── index.html              # Main application
├── app.js                  # Application logic
├── style.css               # Styling
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── generate_icons.html     # Icon generator tool
├── metadata.json           # App metadata
├── icons/                  # App icons (PNG files)
├── components/             # UI components
└── services/               # Backend services
```

## User Roles

| Role | Access | Permissions |
|------|--------|-------------|
| Viewer | Read-only | View sales, records, prices |
| Admin | Full | Create, edit, delete all data |
| Presenter | Prices only | Update product prices only |

## Design

- iOS 17 frosted glass aesthetic
- Dark mode optimized for night viewing
- Mobile-first responsive design
- Accessibility-friendly with proper contrast

## License

Private - Internal use only
