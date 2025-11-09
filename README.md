# Shchakim Display - Raspberry Pi Display System

A Next.js application designed for Raspberry Pi displays, featuring pairing functionality, prayer times (zmanim), daily halacha, and display management.

## Features

- 📱 **Display Pairing**: Pair displays with boards via QR code
- 🕐 **Prayer Times (Zmanim)**: Real-time prayer time calculations
- 📖 **Daily Halacha**: Daily Jewish law content
- 🎨 **Custom Fonts**: Support for Hebrew fonts (Polin family)
- 📊 **Board Management**: Claim and manage display boards
- 🔄 **Service Worker**: Offline functionality support

## Tech Stack

- **Framework**: Next.js 15.0.3
- **Language**: TypeScript
- **UI**: React 18.3.1
- **Hebrew Calendar**: @hebcal/core 6.0.5

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nihug-rabaz/shchakim-3-rpi.git
cd shchakim-3-rpi
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server (runs on 0.0.0.0:3000)
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── board-info/   # Board information
│   │   ├── claim/        # Board claiming
│   │   ├── display/      # Display management
│   │   ├── fonts/        # Font listing
│   │   ├── halacha/      # Daily halacha
│   │   └── zmanim/       # Prayer times
│   ├── claim/            # Claim page
│   ├── display/          # Display page
│   ├── pair/             # Pairing page
│   └── components/       # React components
├── utils/                # Utility functions
public/                    # Static assets
│   ├── fonts/           # Font files
│   └── config.json      # Configuration
```

## API Endpoints

- `GET /api/zmanim` - Get prayer times
- `GET /api/halacha/daily` - Get daily halacha
- `GET /api/fonts/list` - List available fonts
- `GET /api/board-info` - Get board information
- `POST /api/claim` - Claim a board
- `POST /api/display/pair/request` - Request pairing
- `POST /api/display/pair/confirm` - Confirm pairing
- `GET /api/display/content` - Get display content

## Configuration

Edit `public/config.json` to configure the application settings.

## Deployment

### Build for Production

```bash
npm run build
npm start
```

The production server will run on `0.0.0.0:3000`, making it accessible on your local network.

## License

Private project

## Repository

[GitHub Repository](https://github.com/nihug-rabaz/shchakim-3-rpi)

