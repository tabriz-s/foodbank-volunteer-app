# Volunteer Management System

We are designing a web application for a food bank-based nonprofit organization. The core users of the app will be volunteers and administrators. Since we are catering to a wide variety of users, the app will be simple but intuitive, with cross-platform functionality.

## Development Methodology

## High-Level Design / Architecture

## Features/Commponent Interaction

- **Volunteer Management**: Register volunteers and track their skills, preferences, and availability
- **Event Management**: Create and manage volunteer events with location and requirements
- **Matching**: Automatically match volunteers to events based on skills, preferences, and proximity
- **Notifications**: Backend calls for notifications/emails to the API which will send event reminders.
- **History**: During or after event creation/completion, record it in the status attribute of the EVENTS table.
- **Geolocation**: Calculate distances between volunteers and event locations

## Tech Stack

### Frontend

- JS/React
- Tailwind CSS
- Firebase Authentication

### Backend

- Node.js/Express.js
- MySQL database

### API's and external services

- Google Maps API for geolocation and distance matching
- Azure Database for hosting
- Vercel for deployment

---

## For the group:

```bash
git clone <repo-url>
npm run install:all
```

- Create .env files in both client/ and server/ (see .env.example for reference)

```bash
npm run dev
```

### Git workflow:

```bash
# 1. Always pull the latest code
git pull origin main

# 2. Create a new branch for your feature. Ex:
git checkout -b feature/user-authentication
# or
git checkout -b feature/volunteer-dashboard
# or
git checkout -b feature/event-management

# 3. Work on your feature...

# 4. Commit and push
git add .
git commit -m "Add: Firebase user authentication"
git push origin feature/user-authentication

# 5. Create a Pull Request on GitHub

# 6. After merge is approved
git checkout main
git pull origin main
git branch -d feature/user-authentication
```

#### Commit message format:

Type: Brief description

- Detailed change 1
- Detailed change 2
- Any breaking changes

Types: Add, Update, Fix, Remove, Refactor

#### For small changes just commit directly to main:

```bash
# 1. Always pull first
git pull origin main

# 2. Make your small change
# 3. Stage, commit, and push
git add .
git commit -m "Fix: typo in README"
git push origin main
```
