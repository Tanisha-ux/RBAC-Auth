# Ledgerly — Full Stack Auth System

A full-stack authentication and RBAC system built from scratch with Node.js, Express, PostgreSQL, and EJS. No third-party auth libraries.

## Tech Stack
- **Backend:** Node.js, Express.js, PostgreSQL
- **Auth:** JWT, bcrypt, Nodemailer
- **Frontend:** EJS, Vanilla CSS, Vanilla JavaScript
- **Security:** Helmet, express-rate-limit, express-validator

## Features
- Signup with email verification
- Login with bcrypt password hashing
- JWT in httpOnly cookies
- Forgot password / reset password flow
- Role-based access control (Admin / User)
- Admin dashboard — manage users and roles
- Record management (income / expense) per user
- Rate limiting and input sanitization

## Local Setup

**1. Clone and install**
```bash
git clone https://github.com/yourusername/ledgerly.git
cd ledgerly
npm install
```

**2. Create `.env`**
```
PORT=3001
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

**3. Run**
```bash
node index.js
```

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/users/signup` | Register |
| POST | `/api/users/login` | Login |
| GET | `/api/users/logout` | Logout |
| GET | `/api/users/verify-email/:token` | Verify email |
| POST | `/api/users/forgot-password` | Send reset email |
| POST | `/api/users/reset-password/:token` | Reset password |
| PATCH | `/api/users/:id/role` | Update role (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |
| POST | `/api/records` | Add record |
| GET | `/api/records` | Get records |
| PATCH | `/api/records/:id` | Update record |
| DELETE | `/api/records/:id` | Delete record |

## Author
**Tanisha Negi** — [GitHub](https://github.com/Tanisha-ux)
