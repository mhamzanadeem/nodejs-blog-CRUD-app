# Medium Blog App

A full-featured blog application where users can sign up, write stories, upload cover images, comment on posts, and manage their content.

---

## Features

- User authentication (sign up / sign in / sign out)
- Create, edit, and delete blog posts
- Upload cover images for stories
- Comment on posts
- Responsive design (works on desktop & mobile)
- Account deletion with all associated data

---

## Prerequisites

Before running this project, you need two things installed on your computer:

### 1. Node.js (includes npm)

Download and install from: https://nodejs.org (Download the **LTS** version)

To verify it's installed, open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
node --version
npm --version
```

You should see version numbers like `v18.x.x` and `10.x.x`.

### 2. MongoDB

MongoDB is the database that stores all the data (users, blog posts, comments).

#### Option A: Install MongoDB locally (recommended)

**Windows:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer — accept all default settings
3. After installation, MongoDB starts automatically as a Windows service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu / Linux:**
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg

# Add repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install
sudo apt update && sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

To verify MongoDB is running, open a terminal and type:
```bash
mongosh
```
If you see a `test>` prompt, MongoDB is working. Type `exit` to leave.

#### Option B: Use MongoDB Atlas (cloud, no installation)

1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free" and create a free account
3. Create a free cluster (it takes 1-2 minutes)
4. Click "Connect" → "Drivers" → copy the connection string
5. Replace the `MONGO_URL` in your `.env` file with this string (see step 4 in installation)

---

## Installation

Follow these steps exactly in order:

### Step 1: Download the project

Open your terminal and navigate to where you want to store the project, then run:

```bash
git clone https://github.com/mhamzanadeem/nodejs-blog-CRUD-app.git
cd nodejs-blog-CRUD-app
```

### Step 2: Install dependencies

Run this command in the project folder:

```bash
npm install
```

This will download all required packages. You'll see a progress bar and then a success message.

### Step 3: Configure environment variables

The project uses a `.env` file to store configuration. An example file is already provided.

Open the `.env` file in any text editor (Notepad, VS Code, etc.) and verify the settings:

```
MONGO_URL=mongodb://127.0.0.1:27017/medium-clone
JWT_SECRET=medium-app-jwt-secret-change-in-production
COOKIE_SECRET=medium-app-cookie-secret-change-in-production
PORT=8000
NODE_ENV=development
```

- **MONGO_URL**: This is where MongoDB is running. If you installed MongoDB locally, leave this as-is.
- **JWT_SECRET**: A secret key used for user authentication. You can change it to any random string.
- **COOKIE_SECRET**: Another secret for securing browser cookies. Change it to any random string.
- **PORT**: The port number the app runs on. Default is `8000`.
- **NODE_ENV**: Set to `development` for local use.

### Step 4: Run the app

```bash
npm start
```

You should see:

```
Server Started at PORT:8000
MongoDB Connected
```

### Step 5: Open in browser

Open your web browser and go to:

```
http://localhost:8000
```

---

## How to Use

### Sign Up

1. Click **"Get Started"** in the top-right corner
2. Enter your full name, email, and password (at least 8 characters)
3. Click **"Create Account"**
4. You'll be redirected to sign in

### Sign In

1. Click **"Sign In"**
2. Enter your email and password
3. Click **"Sign In"**

### Create a Story

1. Click the **"Write"** button in the navbar
2. (Optional) Upload a cover image by clicking the upload area
3. Enter a title and your story content
4. Click **"Publish"**

### Read a Story

Click on any blog card on the home page, or click the **"Read more →"** button.

### Comment on a Story

Scroll to the bottom of any story, type your comment, and click **"Submit"**.

### Edit a Story

1. Open your story
2. Click the **"Edit story"** button
3. Make your changes and click **"Update"**

### Delete a Story

1. Open your story
2. Click the **"Delete story"** button
3. Confirm the deletion

### Sign Out

Click **"Sign Out"** in the navbar.

### Delete Your Account

Click **"Delete Account"** in the navbar. This permanently removes your account, all your stories, and all your comments.

---

## Project Structure

```
medium-blog-app/
├── app.js                  # Main application entry point
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (do not share)
├── .env.example            # Example environment file
├── middlewares/
│   ├── authentication.js   # Cookie-based auth check
│   └── requireAuth.js      # Route protection middleware
├── models/
│   ├── blog.js             # Blog post schema
│   ├── comment.js          # Comment schema
│   └── user.js             # User schema
├── routes/
│   ├── blog.js             # Blog routes (CRUD + comments)
│   └── user.js             # Auth routes (sign in, sign up, delete)
├── services/
│   └── authentication.js   # JWT token creation & validation
├── views/
│   ├── addBlog.ejs         # Create/Edit blog form
│   ├── blog.ejs            # Single blog post view
│   ├── home.ejs            # Homepage with blog cards
│   ├── signin.ejs          # Sign in page
│   ├── signup.ejs          # Sign up page
│   └── partials/
│       ├── head.ejs        # HTML head with Bootstrap + custom CSS
│       ├── nav.ejs         # Navigation bar
│       └── script.ejs      # Bootstrap JS
└── public/
    ├── images/
    │   └── default.png     # Default user avatar
    └── uploads/            # Uploaded cover images
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | MongoDB ODM (data modeling) |
| **EJS** | Template engine for views |
| **Bootstrap 5** | CSS framework for responsive UI |
| **JWT** | Authentication tokens |
| **Multer** | File upload handling |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting on login |

---

## Security Features

- Passwords are hashed with SHA-256 + salt
- JWT tokens expire after 7 days
- Cookies are HTTP-only and same-site restricted
- Login attempts are rate-limited (10 per 15 minutes)
- File uploads are restricted to image types only (JPEG, PNG, GIF, WebP)
- Uploaded files are saved with random names to prevent guessing
- Security headers set via Helmet
- Input validation on all forms
- Email addresses are stored in lowercase to prevent duplicates
- `node_modules/` and `.env` are excluded from version control

---

## Troubleshooting

### "MongoDB Connected" does not appear

Make sure MongoDB is running. On Ubuntu/Linux: `sudo systemctl start mongod`. On macOS: `brew services start mongodb-community`. On Windows, check Services (run `services.msc`) for MongoDB.

### "EADDRINUSE" error when starting

Another program is using port 8000. Change the `PORT` in `.env` to another number (e.g., `PORT=3000`).

### Uploaded images don't show

Make sure the `public/uploads/` folder exists. If not, create it:
```bash
mkdir -p public/uploads
```

---

