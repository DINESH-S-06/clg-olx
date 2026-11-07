# 🏫 Campus Marketplace (CLG OLX) - Backend API

A robust, production-ready RESTful backend API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for campus peer-to-peer buying and selling.

---

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js              # User schema (name, email, password, whatsappNumber, hostelBlock)
│   └── Product.js           # Product schema (title, description, category, condition, price, imageUrl, seller, isSold)
├── routes/
│   ├── auth.js              # Registration, Login, and Me endpoints (bcryptjs + JWT)
│   └── products.js          # Product listing (with search & filters), creation, update, delete
├── middleware/
│   ├── auth.js              # JWT authentication & authorization middleware
│   └── upload.js            # Multer & Cloudinary image upload middleware
├── .env.example             # Template for environment variables
├── .env                     # Local environment settings
├── package.json             # Dependencies and scripts
└── server.js                # Express app initialization, CORS, and MongoDB connection
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Verify or edit `.env` in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus_marketplace
JWT_SECRET=campus_marketplace_jwt_secret_key_change_me_in_production

# Optional: Cloudinary credentials for image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Start the Server
- **Development (with hot-reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

---

## 📡 API Endpoints

### 🔑 Authentication Routes (`/api/auth`)

#### 1. Register a Student User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "Alex Kumar",
    "email": "alex.student@college.edu",
    "password": "securepassword123",
    "whatsappNumber": "+919876543210",
    "hostelBlock": "Block C - Room 304"
  }
  ```
- **Response:** `201 Created` with JWT token and user info.

#### 2. User Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "alex.student@college.edu",
    "password": "securepassword123"
  }
  ```
- **Response:** `200 OK` with JWT token and user info.

#### 3. Get Current User Profile
- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

### 📦 Product Routes (`/api/products`)

#### 1. Get All Products (with Search & Filters)
- **Method:** `GET`
- **URL:** `/api/products`
- **Query Parameters:**
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `search` | string | Keyword search in title & description |
  | `category` | string | Filter by: `Books`, `Electronics`, `Lab Equipment`, `Furniture`, `Others` |
  | `condition` | string | Filter by: `Brand New`, `Like New`, `Gently Used`, `Heavily Used` |
  | `minPrice` | number | Minimum price |
  | `maxPrice` | number | Maximum price |
  | `isSold` | boolean | `false` for available items only |
  | `sort` | string | `newest`, `oldest`, `price_asc`, `price_desc` |
- **Example:**
  ```
  GET /api/products?search=calculator&category=Electronics&condition=Like New&maxPrice=1500
  ```

#### 2. Get Single Product by ID
- **Method:** `GET`
- **URL:** `/api/products/:id`

#### 3. Create a New Product Listing
- **Method:** `POST`
- **URL:** `/api/products`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body (JSON):**
  ```json
  {
    "title": "Casio FX-991EX Scientific Calculator",
    "description": "Used for 1 semester in Engineering Mathematics. Excellent battery and display condition.",
    "category": "Electronics",
    "condition": "Like New",
    "price": 850,
    "imageUrl": "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd"
  }
  ```
- *(Also supports `multipart/form-data` with file field `image`)*

#### 4. Mark Product as Sold (Seller Only)
- **Method:** `PATCH`
- **URL:** `/api/products/:id/sold`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body (optional):**
  ```json
  {
    "isSold": true
  }
  ```

#### 5. Delete Product Listing (Seller Only)
- **Method:** `DELETE`
- **URL:** `/api/products/:id`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
