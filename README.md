# Medium Blog App

A full-stack blog application with a **React (Vite + Tailwind)** frontend and **Node.js/Express JSON API** backend. Users can sign up, write stories with a rich text editor, upload cover images, comment on posts, and manage their profile. Data is stored in **MongoDB Atlas**.

---

## Features

- User authentication (sign up / sign in / sign out) with HTTP-only cookies
- Create, edit, and delete blog posts with a rich text editor (Quill)
- Upload cover images and avatar photos
- Comment on posts with threaded replies
- Responsive design with collapsible sidebar (desktop) and drawer navigation (mobile)
- Account deletion with all associated data
- Cloud database (MongoDB Atlas) — no local installation needed
- Security headers, rate limiting, password hashing with SHA-256 + salt
- Server status indicator with wake-up button (for Render/free-tier deployments)

---

## Prerequisites

**Node.js** (LTS) — download from https://nodejs.org

Verify installation:
```bash
node --version
npm --version
```

---

## Installation

### Step 1: Clone the project

```bash
git clone <repo-url>
cd nodejs-crud-app
```

### Step 2: Install backend dependencies

```bash
cd backend
npm install
```

### Step 3: Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Configure environment variables

The backend uses a `.env` file at the **project root**:

```
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medium-clone?retryWrites=true&w=majority
JWT_SECRET=your-strong-random-secret-here
COOKIE_SECRET=another-strong-random-secret
PORT=8000
NODE_ENV=development
```

The frontend uses `frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

For production, change `VITE_API_URL` to your Render/cloud backend URL.

### Step 5: Run the backend

```bash
cd backend
npm start
```

Expected output:
```
Server Started at PORT:8000
MongoDB Connected
```

### Step 6: Run the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Opens at `http://localhost:5173`.

---

## Project Structure

```
nodejs-crud-app/
├── backend/                        # Node.js + Express JSON API
│   ├── app.js                      # Entry point
│   ├── package.json
│   ├── middlewares/
│   │   ├── authentication.js       # Cookie-based JWT check
│   │   └── requireApiAuth.js       # Auth guard for API routes
│   ├── models/
│   │   ├── blog.js                 # Blog schema
│   │   ├── comment.js              # Comment schema (supports replies)
│   │   └── user.js                 # User schema (password hashing)
│   ├── routes/
│   │   └── api/
│   │       ├── user.js             # Auth, profile, avatar, password
│   │       ├── blog.js             # Blog CRUD, list, search, upload
│   │       └── comment.js          # Comments, replies, delete
│   ├── services/
│   │   └── authentication.js       # JWT create/validate
│   └── public/
│       ├── images/default.png      # Default avatar
│       └── uploads/                # Uploaded images
├── frontend/                       # React + Vite + Tailwind SPA
│   ├── index.html
│   ├── vite.config.js
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Root layout, sidebar context
│       ├── routes.jsx              # Lazy-loaded route definitions
│       ├── api/                    # Axios API client
│       │   ├── axiosConfig.js
│       │   ├── authApi.js
│       │   ├── blogApi.js
│       │   └── commentApi.js
│       ├── components/
│       │   ├── auth/               # SignIn, SignUp
│       │   ├── blogs/              # BlogList, BlogDetails, CreateBlog, EditBlog
│       │   ├── common/             # Navbar, BlogCard, Comment, Footer, Modal, Loader, ServerStatus
│       │   └── profile/            # Settings (profile, security, posts, danger zone)
│       ├── context/                # AuthContext, BlogContext
│       ├── hooks/                  # useAuth, useBlog, useToast
│       ├── pages/                  # Page wrappers for each route
│       ├── styles/
│       │   └── globals.css         # Design tokens, fonts, Quill styles
│       └── utils/
│           ├── constants.js
│           ├── formatters.js
│           └── validators.js
├── .env                            # Backend environment variables
├── .env.example
└── .gitignore
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server health check |
| POST | `/api/users/signup` | No | Create account |
| POST | `/api/users/signin` | No | Sign in |
| POST | `/api/users/signout` | No | Sign out |
| GET | `/api/users/profile` | Yes | Get profile |
| PUT | `/api/users/profile` | Yes | Update profile |
| POST | `/api/users/avatar` | Yes | Upload avatar |
| PUT | `/api/users/password` | Yes | Change password |
| DELETE | `/api/users/account` | Yes | Delete account |
| GET | `/api/blogs` | No | List blogs (paginated, searchable) |
| GET | `/api/blogs/mine` | Yes | Get user's blogs |
| GET | `/api/blogs/:id` | No | Get single blog |
| POST | `/api/blogs` | Yes | Create blog |
| PUT | `/api/blogs/:id` | Yes | Update blog |
| DELETE | `/api/blogs/:id` | Yes | Delete blog |
| POST | `/api/blogs/:id/upload` | Yes | Upload cover image |
| GET | `/api/blogs/:blogId/comments` | No | Get comments (with replies) |
| POST | `/api/blogs/:blogId/comments` | Yes | Add comment |
| POST | `/api/blogs/:blogId/comments/:commentId/reply` | Yes | Reply to comment |
| DELETE | `/api/comments/:id` | Yes | Delete comment |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express** | Web framework |
| **MongoDB Atlas** | Cloud database |
| **Mongoose** | MongoDB ODM |
| **React 19** | Frontend UI library |
| **Vite** | Frontend build tool |
| **Tailwind CSS v4** | Utility CSS framework |
| **React Quill** | Rich text editor |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client |
| **JWT** | Authentication tokens |
| **Multer** | File upload handling |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |

---

## Security

- Passwords hashed with SHA-256 + salt
- JWT tokens expire after 7 days
- HTTP-only, same-site cookies
- Login rate-limited (10 per 15 minutes)
- File uploads restricted to image types (JPEG, PNG, GIF, WebP, max 5MB)
- Files saved with random UUID filenames
- Helmet security headers
- Email addresses stored in lowercase
- `node_modules/` and `.env` excluded from version control

---

## Troubleshooting

### MongoDB connection fails
Check `MONGO_URL` in `.env`. Whitelist all IPs (`0.0.0.0/0`) in MongoDB Atlas Network Access.

### Port in use
Change `PORT` in `.env` (e.g., `PORT=3001`).

### Frontend can't reach backend
Ensure backend is running. Check `VITE_API_URL` in `frontend/.env` matches your backend URL.
