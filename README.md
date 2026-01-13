# FCC Restaurant Management System

A complete restaurant management system with customer ordering and staff management.

## 🚀 Live Demo

- **Customer App**: [Coming Soon]
- **Staff Dashboard**: [Coming Soon]
- **API**: [Coming Soon]

## 📱 Features

### Customer Features
- 📱 Mobile-first responsive design
- 🍽️ Browse menu with categories
- 🛒 Shopping cart with quantity management
- 📱 OTP-based authentication
- 💳 Razorpay payment integration
- 📄 Digital receipts and invoices
- 📋 Order history and tracking
- 🏷️ QR code table ordering

### Staff Features
- 👨‍💼 Admin dashboard
- 📊 Order management and status updates
- 👥 Customer management
- 🏷️ Table management with QR codes
- 📈 Sales analytics and reporting
- 🖨️ Receipt printing
- 📱 Real-time order notifications

### Technical Features
- 🔐 JWT authentication
- 📱 SMS OTP verification (Twilio)
- ☁️ Cloud image storage (Cloudinary)
- 🗄️ MongoDB database
- 🌐 RESTful API
- 📱 Progressive Web App (PWA) ready
- 🔒 Secure payment processing
- 📍 Indian timezone support

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **SMS**: Twilio (OTP delivery)
- **Payments**: Razorpay
- **Storage**: Cloudinary
- **QR Codes**: qrcode library

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite (Rolldown)
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **State Management**: Context API
- **HTTP Client**: Axios (staff), Fetch (customer)
- **Icons**: Lucide React, FontAwesome
- **Notifications**: React Toastify

## 📁 Project Structure

```
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── data/               # Seed data
│   └── server.js           # Entry point
├── frontend - customer/     # Customer React app
│   ├── src/
│   │   ├── Components/     # Reusable components
│   │   ├── Pages/          # Page components
│   │   └── context/        # Context providers
├── frontend - staff/        # Staff dashboard React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   └── pages/          # Page components
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay account
- Twilio account (for SMS OTP)
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fcc-restaurant.git
cd fcc-restaurant
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

3. **Setup Customer Frontend**
```bash
cd "frontend - customer"
npm install
npm run dev
```

4. **Setup Staff Frontend**
```bash
cd "frontend - staff"
npm install
npm run dev
```

### Environment Variables

See `.env.example` files in each directory for required environment variables.

## 🌐 Deployment

This project is configured for easy deployment on:
- **Backend**: Railway
- **Frontends**: Vercel
- **Database**: MongoDB Atlas

Run the deployment script:
```bash
# Windows
deploy.bat

# Linux/Mac
./deploy.sh
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🔧 Configuration

### Payment Gateway
- Supports Razorpay for Indian payments
- Test and live mode configuration
- Automatic payment verification

### QR Code System
- Dynamic QR code generation for tables
- Automatic table detection
- Mobile-optimized ordering flow

### Time Zone
- All times displayed in Indian Standard Time (IST)
- Automatic timezone conversion
- Consistent date formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact:
- Email: support@yourrestaurant.com

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Twilio for SMS OTP delivery
- Razorpay for payment processing
- MongoDB for the database
- Vercel and Railway for hosting
