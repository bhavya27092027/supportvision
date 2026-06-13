# SupportVision - Real-Time Video Support Platform

A production-ready web application for customer support teams to conduct video support sessions with customers.

## Features

### Authentication
- Secure signup/login via Supabase Auth
- JWT-based session management
- Role-based access control (Agent/Admin)
- Persistent sessions with automatic token refresh

### Agent Capabilities
- Create and manage support sessions
- Generate unique invite links for customers
- Start/end video calls
- Real-time chat during sessions
- View session history and recordings
- Share files during sessions

### Customer Experience
- Join sessions via secure invite link (no account required)
- Video/audio controls
- Real-time chat
- File sharing

### Admin Dashboard
- View all active sessions across the platform
- Monitor participants and duration
- Platform-wide analytics with charts
- User management
- Force-end sessions when needed
- Session logs and audit trail

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **State Management**: Zustand with persistence
- **Routing**: React Router v6
- **Charts**: Recharts
- **Animations**: Framer Motion

## Project Structure

```
src/
├── components/
│   ├── layout/           # Dashboard, Sidebar, Navbar layouts
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and Supabase client
├── pages/                # Route pages
│   ├── LandingPage       # Public landing
│   ├── LoginPage         # Authentication
│   ├── RegisterPage      # User registration
│   ├── JoinSessionPage   # Customer join flow
│   ├── DashboardPage     # Agent dashboard
│   ├── SessionsPage      # Session management
│   ├── SessionPage       # Video call interface
│   ├── SessionDetailPage # Session history details
│   ├── HistoryPage       # Past sessions
│   ├── RecordingsPage    # Recording library
│   └── Admin*Pages       # Admin dashboard pages
├── stores/               # Zustand state stores
├── types/                # TypeScript types
└── App.tsx               # Main app with routing
```

## Database Schema

### Tables

- **profiles** - User accounts (extends Supabase auth.users)
- **sessions** - Support sessions with invite tokens
- **participants** - Session participants
- **messages** - Real-time chat messages
- **recordings** - Session recording metadata
- **shared_files** - File sharing records
- **session_events** - Audit trail

## API Endpoints

All data operations use Supabase client SDK:

### Authentication
- `supabase.auth.signUp()` - Register new user
- `supabase.auth.signInWithPassword()` - Login
- `supabase.auth.signOut()` - Logout

### Sessions
- `supabase.from('sessions').insert()` - Create session
- `supabase.from('sessions').update()` - Update session status
- `supabase.from('sessions').select()` - Fetch sessions

### Real-time Subscriptions
- Session participants changes
- New message notifications
- Session status updates

## Key Flows

### Agent Creates Session
1. Agent clicks "New Session" on dashboard
2. Enters title/description
3. Session created with unique invite token
4. Modal shows shareable invite link
5. Agent copies link and shares with customer

### Customer Joins Session
1. Customer opens invite link `/join/:token`
2. Enters name
3. Session validated and participant record created
4. Redirected to video session page
5. Waits for agent to start session

### Video Session
1. Agent starts session (status → active)
2. Real-time video/audio with WebRTC
3. Chat sidebar for messaging
4. Recording can be started
5. Session ends (status → ended)

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admin role has broader access for monitoring
- Invite tokens are cryptographically random
- Sessions require authentication (except for customers joining)

## License

MIT
