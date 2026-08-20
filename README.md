# Friends Cafe - Restaurant Management System

A full-stack restaurant management solution with separate customer ordering interface and staff dashboard for seamless restaurant operations.

## Live Demo

- **Customer App**: https://friends-cafe-v5m2.vercel.app
- **Staff Dashboard**: https://friends-cafe-seven.vercel.app
- **Backend API**: https://friends-cafe.onrender.com

## Screenshots

<img width="535" height="760" alt="image" src="https://github.com/user-attachments/assets/49c7f371-d2c7-4465-a61d-9b1617682283" />
<img width="521" height="752" alt="image" src="https://github.com/user-attachments/assets/f060c986-6877-4862-b00e-23b7af72347e" />
<img width="1901" height="863" alt="image" src="https://github.com/user-attachments/assets/989f5174-e606-417e-92db-d61a55798c62" />
<img width="1902" height="867" alt="image" src="https://github.com/user-attachments/assets/21a8a8e0-e0e6-4c00-9a8b-374687949870" />
<img width="1891" height="867" alt="image" src="https://github.com/user-attachments/assets/cff0842d-4316-411c-9694-a5b8f15dacb5" />

## Overview

This is a production-ready restaurant management system built to handle customer orders, payments, table management, and staff operations. The application features two separate interfaces:

1. **Customer App** - Mobile-responsive ordering interface with QR code table access
2. **Staff Dashboard** - Complete POS system with order management and analytics

## Key Features

**Customer Experience**
- Browse menu with category filtering
- Add items to cart with real-time total calculation
- Secure OTP-based login
- Online payment via Razorpay
- View order history and digital receipts
- QR code-based table ordering

**Staff Operations**
- Complete POS system for order management
- Real-time order status tracking
- Customer and order history management
- Table management with QR code generation
- Sales analytics and revenue reports
- Product inventory management

## Tech Stack

**Backend**
- Node.js & Express.js - RESTful API
- MongoDB - Database with Mongoose ODM
- JWT - Authentication & authorization
- Razorpay - Payment gateway integration
- Cloudinary - Image storage
- Twilio - SMS notifications (optional)

**Frontend**
- React 19 - UI library
- Vite - Build tool
- Tailwind CSS 4 - Styling
- React Router v7 - Client-side routing
- Axios - HTTP client
- Context API - State management

**Deployment**
- Vercel - Frontend hosting
- Render - Backend hosting
- MongoDB Atlas - Cloud database

## Project Structure

```
friends-cafe/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   └── server.js        # Express server
│
├── frontend - customer/
│   └── src/
│       ├── Components/  # UI components
│       ├── Pages/       # Page views
│       └── context/     # State management
│
└── frontend - staff/
    └── src/
        ├── components/  # UI components
        └── pages/       # Dashboard views
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Razorpay account (for payments)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Krushna-a/friends-cafe.git
cd friends-cafe
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Create `.env` file in backend folder
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=http://localhost:5173
```

4. Start backend server
```bash
npm start
```

5. Install and run customer frontend (in new terminal)
```bash
cd "frontend - customer"
npm install
npm run dev
```

6. Install and run staff frontend (in new terminal)
```bash
cd "frontend - staff"
npm install
npm run dev
```

The applications will be available at:
- Customer App: http://localhost:5173
- Staff Dashboard: http://localhost:5174
- Backend API: http://localhost:4000

## Deployment

The project is configured for deployment on:
- **Vercel** for both frontends
- **Render** for backend
- **MongoDB Atlas** for database

Update CORS origins in `backend/server.js` with your deployed URLs.


### Customer App
- Home page
- Menu browsing
- Cart and checkout
- Order history

### Staff Dashboard
- POS system
- Order management
- Analytics dashboard
- Table management

## API Endpoints

**Authentication**
- `POST /api/auth/login` - User login with OTP
- `GET /api/auth/me` - Get current user

**Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

**Orders**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `PATCH /api/orders/:id/pay` - Mark order as paid

**Admin** (Staff only)
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/products` - Create product
- `GET /api/admin/stats` - Get sales analytics

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

## Contact

For questions or support, please open an issue on GitHub.
