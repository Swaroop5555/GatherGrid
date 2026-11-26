
# GatherGrid – Event Discovery & Booking Platform

GatherGrid is a full-stack event discovery and booking platform that connects customers with event organizers. It allows users to explore event categories, discover event services and packages, submit booking requests, and track booking status through a user-friendly interface.

The platform provides separate experiences for customers, organizers, and administrators, with role-based access control and an approval workflow for event organizers.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Application Workflow](#application-workflow)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Security](#security)
- [Future Enhancements](#future-enhancements)

---

## Project Overview

GatherGrid simplifies the process of discovering event services and connecting with organizers.

Customers can browse available event listings, view detailed service information, compare packages, and submit booking requests. Organizers can manage their event listings and respond to customer bookings. Administrators manage users and approve or reject organizer registrations.

The application follows a client-server architecture:

- **Frontend:** React-based user interface.
- **Backend:** Node.js and Express REST API.
- **Database:** MongoDB with Mongoose.
- **Image Storage:** Cloudinary.
- **Authentication:** JSON Web Tokens (JWT).

## Features

### 1. Customer Features

- Customer registration and email verification using OTP.
- Secure login and password authentication.
- Browse event categories and available event listings.
- Search for events using keywords.
- Filter events by category and featured status.
- View event details, organizers, services, and packages.
- Submit booking requests with event date, location, guest count, selected package, and additional message.
- View personal booking history and booking status.
- Cancel booking requests.
- Access a dedicated customer dashboard.

### 2. Organizer Features

- Register as an event organizer with organization details.
- Verify email through OTP.
- Wait for administrator approval before accessing organizer management features.
- Create event listings with descriptions, categories, services, and packages.
- Upload event images using Cloudinary.
- Update and delete event listings.
- View and manage organizer events.
- View customer booking requests.
- Update booking status through the organizer dashboard.
- Access an organizer dashboard after approval.

### 3. Administrator Features

- Access a protected administrator dashboard.
- View registered users and organizers.
- Approve or reject organizer registrations.
- Manage user account status.
- View all bookings.
- Update booking statuses.
- Control organizer access through the approval process.

### 4. Additional Features

- Password reset using email OTP.
- Public organizer listings and organizer details.
- Contact form for submitting messages.
- Featured event listings.
- Event category management.
- Responsive frontend pages.
- Centralized API communication using Axios.
- Protected frontend routes and backend authorization middleware.

## User Roles

| Role | Main Responsibilities |
|---|---|
| Customer | Discover events, submit bookings, track and cancel bookings |
| Organizer | Create events, manage listings, respond to bookings |
| Administrator | Approve organizers, manage users, monitor bookings |

The application uses role-based authorization to restrict access to customer, organizer, and administrator operations.

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- JavaScript
- HTML5
- CSS3
- Lucide React icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Nodemailer
- Cloudinary
- Multer

### Security and Middleware

- Helmet
- CORS
- Express Rate Limit
- JWT authentication
- Role-based authorization
- Centralized error handling

### Development Tools

- Git and GitHub
- npm
- Nodemon
- ESLint

## System Architecture

GatherGrid uses a three-tier architecture consisting of a presentation layer, application layer, and data layer.

The React frontend communicates with the Express backend through REST APIs. The backend validates requests, applies authentication and authorization, executes business logic, and interacts with MongoDB or external services.

See the architecture diagram below for the complete request flow.

## Project Structure

```text
GatherGrid/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Organizers.jsx
│   │   │   ├── OrganizersDetails.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── OrganizerDashboard.jsx
│   │   │   ├── OrganizerEvents.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── About.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── categoryController.js
│   │   ├── eventController.js
│   │   └── ContactController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── authRateLimit.js
│   │   ├── errorMiddleware.js
│   │   └── notFound.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Booking.js
│   │   ├── EventCategory.js
│   │   └── OTP.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── eventRoutes.js
│   │   └── organizerRoutes.js
│   │
│   ├── scripts/
│   │   ├── createAdmin.js
│   │   ├── seedCategories.js
│   │   └── updateAdminEmail.js
│   │
│   ├── utils/
│   │   └── sendEmail.js
│   │
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Application Workflow

### Customer Booking Workflow

1. A customer registers and verifies their email address.
2. The customer logs in and receives an authentication token.
3. The customer browses events and selects an event listing.
4. The customer views the event details, available packages, and organizer information.
5. The customer submits a booking request with the required event details.
6. The backend validates the request and stores the booking in MongoDB.
7. The organizer views the booking request and updates its status.
8. The customer can view the updated booking status in their dashboard.

### Organizer Approval Workflow

1. An organizer registers with organization information.
2. The organizer verifies their email address.
3. The organizer account is created with a pending approval status.
4. The administrator reviews the organizer registration.
5. The administrator approves or rejects the organizer.
6. Approved organizers can access event creation and booking management features.

### Authentication Workflow

1. The user submits login credentials.
2. The backend validates the credentials against the stored account.
3. The password is checked using bcryptjs.
4. The backend generates a JWT containing the user ID and role.
5. The frontend uses the token for authenticated API requests.
6. Backend middleware verifies the token and checks the user's permissions.

## Database Design

GatherGrid uses MongoDB for data persistence and Mongoose for schema definition, validation, and database operations.

### User Collection

Stores customer, organizer, and administrator accounts.

Important fields:

- `name`
- `email`
- `password`
- `role`
- `organizationName`
- `licenseNumber`
- `officialEmail`
- `isEmailVerified`
- `isApproved`
- `approvalStatus`
- `isActive`
- `profileImage`

### Event Collection

Stores event listings created by organizers.

Important fields:

- `organizer`
- `title`
- `slug`
- `category`
- `shortDescription`
- `description`
- `image`
- `gallery`
- `services`
- `packages`
- `estimatedDuration`
- `startingPrice`
- `tags`
- `isFeatured`
- `isActive`

Each event is associated with an organizer and an event category.

### Booking Collection

Stores booking requests submitted by customers.

Important fields:

- `customer`
- `organizer`
- `event`
- `eventDate`
- `eventLocation`
- `guestCount`
- `packageName`
- `packagePrice`
- `message`
- `status`
- `statusHistory`

Booking statuses include:

- Pending
- Approved
- Rejected
- Completed
- Cancelled

The booking status history records the status, the user who changed it, the date of the change, and an optional note.

### EventCategory Collection

Stores event categories used to organize and filter event listings.

Important fields:

- `name`
- `slug`
- `description`
- `image`
- `icon`
- `isActive`
- `sortOrder`

### OTP Collection

Stores OTP verification records used for registration and password reset.

The OTP records include the email address, hashed OTP, purpose, expiration time, and verification attempt information.

## API Documentation

The backend exposes REST API endpoints under the `/api` prefix.

### Authentication APIs

Base URL: `/api/auth`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/send-otp` | Send registration OTP |
| POST | `/register` | Register a user |
| POST | `/login` | Authenticate a user |
| POST | `/forgot-password` | Send password reset OTP |
| POST | `/reset-password` | Reset password |
| GET | `/me` | Get current authenticated user |

### Event APIs

Base URL: `/api/events`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Retrieve events with search and filters |
| GET | `/:id` | Retrieve event details |
| POST | `/` | Create an event |
| GET | `/my-events` | Retrieve organizer's events |
| POST | `/:id/image` | Upload an event image |
| PUT | `/:id` | Update an event |
| DELETE | `/:id` | Delete an event |

Event creation, image upload, updating, and deletion require an authenticated and approved organizer.

### Booking APIs

Base URL: `/api/bookings`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/` | Create a customer booking |
| GET | `/my-bookings` | Retrieve customer bookings |
| GET | `/organizer` | Retrieve organizer bookings |
| PATCH | `/:id/status` | Update booking status |
| PATCH | `/:id/cancel` | Cancel a customer booking |
| GET | `/admin` | Retrieve all bookings |
| PATCH | `/admin/:id/status` | Update booking status as admin |

### Administrator APIs

Base URL: `/api/admin`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/organizers` | Retrieve organizer accounts |
| PATCH | `/organizers/:id/approve` | Approve an organizer |
| PATCH | `/organizers/:id/reject` | Reject an organizer |
| GET | `/users` | Retrieve users |
| PATCH | `/users/:id/status` | Update user account status |

### Additional APIs

| Base URL | Method | Endpoint | Purpose |
|---|---|---|---|
| `/api/categories` | GET | `/` | Retrieve categories |
| `/api/categories` | GET | `/:id` | Retrieve a category |
| `/api/organizers` | GET | `/` | Retrieve public organizers |
| `/api/organizers` | GET | `/:id` | Retrieve organizer details |
| `/api/contact` | POST | `/` | Submit a contact message |

## Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account for event image storage
- Email account or SMTP credentials for OTP delivery

### Step 1: Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd GatherGrid
```

Replace the repository URL with your actual GitHub repository URL.

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Backend Environment

Create a `.env` file inside the `backend` directory and add the required environment variables.

```env
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

Use your own credentials. Never commit real passwords, API keys, database credentials, or JWT secrets to GitHub.

### Step 4: Start the Backend

```bash
npm run dev
```

The backend runs on port `5000` by default.

### Step 5: Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### Step 6: Configure Frontend Environment

Create a `.env` file inside the `frontend` directory.

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 7: Start the Frontend

```bash
npm run dev
```

Vite will display the local development URL in the terminal, usually:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

## Running the Application

### Backend Commands

```bash
npm run dev
```

Runs the backend using Nodemon.

```bash
npm start
```

Starts the backend using Node.js.

```bash
npm run seed
```

Runs the backend seed script.

### Frontend Commands

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production frontend build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint on the frontend.

## Security

GatherGrid implements several security measures:

- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based authorization for protected API routes.
- Organizer approval checks before event management.
- OTP expiration and hashed OTP storage.
- Rate limiting for OTP and login endpoints.
- Helmet security headers.
- CORS configuration.
- Validation of booking details and event identifiers.
- Protected frontend routes.
- Environment variables for sensitive configuration.

## Future Enhancements

Potential future improvements include:

- Online payment gateway integration.
- Booking confirmation notifications.
- Advanced event search and filtering.
- Booking calendar and availability management.
- Customer reviews and ratings.
- Automated booking reminders.
- Automated API documentation with Swagger.
- Unit and integration testing.
- Production deployment and CI/CD automation.

---

## Project Status

GatherGrid has been developed as a full-stack event discovery and booking application with customer, organizer, and administrator workflows.

The project demonstrates full-stack development concepts including REST API design, database modeling, authentication, authorization, file uploads, and role-based application workflows.
