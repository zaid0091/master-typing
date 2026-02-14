# Typing Master

A modern typing speed test application with user accounts, achievements, clans, a cosmetic shop, and comprehensive statistics tracking.

**Live:** [master-typing-steel.vercel.app](https://master-typing-steel.vercel.app)

## Features

### Core Typing Test
- Real-time WPM, CPM, and accuracy tracking
- Multiple difficulty levels (Easy, Medium, Hard)
- Flexible test durations (15s, 30s, 60s, Unlimited)
- Multiple text types: English, Motivational, Technical Code, Custom
- Special modes: Normal, No Error, Blind

### Accounts & Progression
- User registration and login
- XP and leveling system
- Bits (currency) earned from tests
- Avatar selection
- Equipped titles, themes, auras, and pets

### Shop
- Cosmetic items purchasable with Bits
- Themes, auras, pets, and titles

### Clans
- Create or join clans
- Clan chat and member management
- Clan leaderboards

### Leaderboard
- Global rankings by WPM
- Filter by time period

### Achievements
- Unlockable badges based on performance
- Speed, accuracy, endurance, and consistency milestones

### Statistics & History
- Full test history with detailed results
- Personal records tracking
- Daily streaks

### UI/UX
- Dark/Light theme toggle
- Keyboard heatmap visualization
- Live coach tips
- Sound effects (toggleable)
- 3D particle background (Three.js)
- Confetti animations on completion
- Responsive design

## Tech Stack

### Frontend
- **React 19** with Vite
- **Three.js** - 3D background effects
- **Canvas Confetti** - Celebration animations
- Deployed on **Vercel**

### Backend
- **Django 5** with Django REST Framework
- **SQLite** (development) / **PostgreSQL** (production)
- **django-cors-headers** for cross-origin requests
- **Gunicorn** + **WhiteNoise** for production serving
- Deployed on **PythonAnywhere**

### Backend Apps
| App | Purpose |
|-----|---------|
| `accounts` | User registration, login, profiles, XP/Bits |
| `typing_tests` | Test submission and result storage |
| `leaderboard` | Global rankings |
| `shop` | Cosmetic items and purchases |
| `clans` | Clan creation, membership, chat |

## Project Structure

```
typing-master/
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context providers
│   │   ├── data/            # Static data (texts, items)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Django REST API
│   ├── config/              # Django settings, URLs, WSGI
│   ├── accounts/            # User accounts app
│   ├── typing_tests/        # Test results app
│   ├── leaderboard/         # Leaderboard app
│   ├── shop/                # Shop app
│   ├── clans/               # Clans app
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ (or Bun)
- Python 3.10+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://localhost:8000`.

### Environment

The frontend expects the backend API at `https://zaid00987.pythonanywhere.com` in production. For local development, update the base URL in `frontend/src/services/api.js`.

## Deployment

- **Frontend:** Vercel (auto-deploys from `main` branch)
- **Backend:** PythonAnywhere (manual deploy via git pull + reload)

## License

This project is open source and available under the [MIT License](LICENSE).
