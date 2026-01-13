# FCC Backend

Simple Express backend for the FCC frontend. Provides basic OTP auth, products and orders endpoints using a simple JSON file as storage (`data/db.json`).

## Setup

- Node 18+ recommended
- In the `backend` folder:

```bash
npm install
cp .env.example .env
# (optional) edit .env
npm run dev
```

Server will run on `http://localhost:4000` by default.

## API

- POST /api/auth/send-otp { mobile, name? }
  - Generates OTP (returned in response when NODE_ENV != 'production')

- POST /api/auth/verify { mobile, code }
  - Verifies OTP and returns { user, token }

- GET /api/auth/me  (Authorization: Bearer <token>)
  - Returns current user

- GET /api/products
  - Returns product list

- GET /api/products/:id
  - Returns product by id

- POST /api/orders  (Authorization)
  - Create order: { items: [...], paid: true|false }

- POST /api/pay/create
  - Create a simulated UPI payment and get a redirect URL (development only)

- GET /api/pay/:id/status
  - Check simulated payment status (development only)

- GET /api/orders  (Authorization)
  - Get user's orders

## MongoDB support

This backend now supports using a MongoDB database via `mongoose`.

- Set `MONGO_URI` in your `.env` (example included in `.env.example`).
- If `MONGO_URI` is present, the server will attempt to connect to MongoDB on start. If no products exist, it will seed products from `data/db.json` automatically.
- If `MONGO_URI` is not set, the server will continue using the file-based `data/db.json` for offline/quick mode.

## Production notes

- Replace OTP and payment simulation with real providers for production (OTP service & payment gateway like Razorpay or a UPI provider).
- Securely store `JWT_SECRET` and other secrets — do not commit them to source control.
- Consider adding input validation, rate limiting, HTTPS, and logging for hardened deployments.

