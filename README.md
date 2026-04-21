# SocialHub - Full-Stack Social Media Application

A modern, professional social media platform built with React (Vite + Tailwind CSS) frontend and Node.js/Express backend with JWT authentication.

## Features

### User Features
- **Authentication**: Register, login, logout with JWT tokens
- **Posts**: Create, edit, delete, and view posts
- **Feed**: View all posts from the community
- **Profile**: View and edit your profile information

### Admin Features
- **Dashboard**: Overview of site statistics (users, posts, active users)
- **User Management**: List, search, ban/unban, and delete users
- **Post Moderation**: View and delete any post on the platform
- **Analytics**: Basic site statistics and activity trends

## Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Context for state management
- React Icons

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- Bcrypt for password hashing
- Joi for validation

## Project Structure

```
SocialMediaApp/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── postController.js  # Post CRUD operations
│   │   ├── userController.js  # User management
│   │   └── adminController.js # Admin panel logic
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── user.js            # User table schema
│   │   └── post.js            # Post table schema
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── post.js            # Post routes
│   │   ├── user.js            # User routes
│   │   └── admin.js           # Admin routes
│   ├── schemas/
│   │   ├── userSchema.js      # User validation schema
│   │   └── postSchema.js      # Post validation schema
│   ├── .env                   # Environment variables
│   ├── index.js               # Express server entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── EditPost.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (already set in `.env`):
   ```
   JWT_SECRET=supersecretjwtkey2026productionready
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

### Building for Production

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. The production build will be in the `dist/` directory

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| PUT | `/api/auth/me` | Update profile | Yes |

### Posts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | Get all posts | No |
| GET | `/api/posts/:id` | Get single post | No |
| GET | `/api/posts/me` | Get user's posts | Yes |
| POST | `/api/posts` | Create post | Yes |
| PUT | `/api/posts/:id` | Update post | Yes |
| DELETE | `/api/posts/:id` | Delete post | Yes |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/me` | Get current user | Yes |
| GET | `/api/users/:id` | Get user by ID | Yes |
| PATCH | `/api/users/:id/toggle-ban` | Ban/unban user | Yes |
| DELETE | `/api/users/:id` | Delete user | Yes |

### Admin
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | Get site statistics | Yes (Admin) |
| GET | `/api/admin/posts` | Get all posts | Yes (Admin) |
| DELETE | `/api/admin/posts/:id` | Delete any post | Yes (Admin) |

## Creating an Admin User

By default, new users are created with the "user" role. To create an admin user:

1. Register a new user through the application
2. Update the user's role directly in the database:
   ```bash
   sqlite3 backend/database.sqlite "UPDATE users SET role='admin' WHERE email='your@email.com';"
   ```

## Default Test Account

A test admin account is available for testing:
- **Email**: admin@test.com
- **Password**: password123

**Note**: Change this password in production!

## Features in Detail

### Authentication
- Secure password hashing with bcrypt
- JWT tokens with 1-hour expiration
- Protected routes requiring authentication
- Role-based access control (admin vs user)

### Posts
- Rich text content support
- Edit and delete own posts
- View all posts in the feed
- Timestamp display

### User Management (Admin)
- View all registered users
- Ban/unban users
- Delete users and their posts
- Protect admin accounts from deletion

### Post Moderation (Admin)
- View all posts on the platform
- Delete inappropriate content
- No restrictions on admin post deletion

## Troubleshooting

### Backend Issues
- Ensure the database file exists in the backend directory
- Check that port 5000 is not in use
- Verify `.env` file contains valid JWT_SECRET

### Frontend Issues
- Ensure the backend is running before starting frontend
- Check that the API URL in `.env` matches your backend
- Clear browser cache if experiencing stale data issues

### Database Issues
- If the database is corrupted, delete `database.sqlite` and restart the backend
- The tables will be recreated automatically on startup

## License

This project is for educational purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
