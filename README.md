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
