# COSC 4353 Project - Volunteer App - Group 10

We are designing a web application for a food bank-based nonprofit organization. The core users of the app will be volunteers and administrators. Since we are catering to a wide variety of users, the app will be simple but intuitive, with cross-platform functionality.

## Development Methodology:

## High-Level Design / Architecture:

## Features/Commponent Interaction:
- **Volunteer Management**:
- **Event Management**: 
- **Matching**: 
- **Notifications**: 

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

### Git workflow (not strictly necessary):

```bash
# 1. pull the latest code
git pull origin main

# 2. Create a new branch for your feature. Ex:
git checkout -b feature/user-authentication
# or 
git checkout -b feature/whatever-the-feature-is

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

Types: Add, Update, Fix, Remove

#### For small changes, just commit directly to main:

```bash
git pull origin main
# Make your small change
git add .
git commit -m "Fix: typo in README"
git push origin main
```
