
# DeliveryTrack Pro

A comprehensive real-time location tracking platform for multivendor delivery services. Built with React, TypeScript, and modern web technologies to provide seamless order management, delivery tracking, and customer experience.

![DeliveryTrack Pro](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&h=300&q=80)

## 🚀 Features

### 📊 Vendor Dashboard
- **Order Management**: Create, view, and manage customer orders
- **Delivery Partner Assignment**: Assign available delivery partners to orders
- **Real-time Status Updates**: Track order progress from pending to delivered
- **Analytics Dashboard**: 
  - Delivery performance metrics
  - Average delivery times
  - Agent performance tracking
  - Revenue analytics with interactive charts
  - Delivery heatmaps

### 🚚 Delivery Partner Dashboard
- **Order Assignment**: View assigned delivery orders
- **Real-time GPS Tracking**: Live location sharing during deliveries
- **Interactive Map**: Route navigation with pickup and dropoff locations
- **Status Management**: Update order status (picked up, in transit, delivered)
- **Location Broadcasting**: Automatic location updates to customers and vendors

### 👥 Customer Portal
- **My Orders**: View personal order history and details
- **Live Order Tracking**: Real-time delivery tracking with map visualization
- **Track by Order ID**: Search and track any order using order ID
- **Delivery Notifications**: Real-time updates on order status
- **Estimated Delivery Time**: Live ETA updates

### ⚡ Real-time Features
- **Live Location Tracking**: GPS-based delivery partner location updates
- **Socket.IO Integration**: Real-time communication between all parties
- **Status Notifications**: Instant updates on order status changes
- **Map Visualization**: Interactive maps with delivery routes and current locations

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **React Router DOM** - Client-side routing

### Real-time & Maps
- **Socket.IO Client** - Real-time bidirectional communication
- **Mapbox GL** - Interactive maps and location services
- **React Map GL** - React wrapper for Mapbox

### Data & State Management
- **TanStack React Query** - Server state management and caching
- **React Hook Form** - Form state management and validation
- **Zod** - Schema validation

### Visualization & UI
- **Recharts** - Interactive charts and analytics
- **Lucide React** - Beautiful icon library
- **Date-fns** - Date manipulation utilities
- **Sonner** - Toast notifications

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or later)
- **npm** or **yarn** package manager
- **Mapbox Account** (for map functionality)
- **Backend Server** (Socket.IO server for real-time features)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd deliverytrack-pro
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=ws://localhost:3001

# App Configuration
VITE_APP_NAME=DeliveryTrack Pro
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   ├── CreateOrderForm.tsx # Order creation form
│   ├── DeliveryAnalytics.tsx # Analytics dashboard
│   └── DeliveryMap.tsx     # Map component for tracking
├── pages/                  # Route components
│   ├── Index.tsx          # Landing page with authentication
│   ├── VendorDashboard.tsx # Vendor management interface
│   ├── DeliveryDashboard.tsx # Delivery partner interface
│   ├── CustomerTracking.tsx # Customer tracking portal
│   └── NotFound.tsx       # 404 error page
├── services/              # API and external services
│   ├── socketService.ts   # Socket.IO client configuration
│   ├── authService.ts     # Authentication service
│   └── orderService.ts    # Order management API
├── hooks/                 # Custom React hooks
│   ├── useLocationTracking.ts # GPS location tracking
│   └── use-toast.ts       # Toast notifications
├── types/                 # TypeScript type definitions
└── lib/                  # Utility functions
```

## 👥 User Roles & Authentication

### Authentication Flow
1. **Landing Page**: Select user type (Customer, Vendor, Delivery Partner)
2. **Login/Signup**: Role-based authentication
3. **Dashboard Redirect**: Automatic redirection to appropriate dashboard

### User Types

#### 🏪 Vendor
- Create and manage orders
- Assign delivery partners
- View analytics and performance metrics
- Track all orders in real-time

#### 🚚 Delivery Partner
- View assigned orders
- Update delivery status
- Share live location during deliveries
- Navigate with interactive maps

#### 👤 Customer
- View order history
- Track deliveries in real-time
- Search orders by ID
- Receive delivery notifications

## 🔄 Real-time Features

### Socket.IO Integration
The application uses Socket.IO for real-time communication:

```typescript
// Location Updates
socketService.sendLocationUpdate(orderId, { lat, lng });

// Status Updates
socketService.sendOrderStatusUpdate(orderId, status);

// Tracking Session
socketService.joinTrackingSession(orderId);
```

### Location Tracking
- **GPS Integration**: Continuous location updates from delivery partners
- **Privacy Controls**: Location sharing only during active deliveries
- **Battery Optimization**: Efficient location polling

## 📊 Analytics Dashboard

### Vendor Analytics Include:
- **Performance Metrics**: Orders completed, average delivery time
- **Revenue Tracking**: Daily, weekly, monthly revenue charts
- **Agent Performance**: Individual delivery partner statistics
- **Geographic Data**: Delivery heatmaps and popular routes
- **Customer Satisfaction**: Delivery time analysis

### Charts and Visualizations:
- Line charts for revenue trends
- Bar charts for delivery performance
- Pie charts for order status distribution
- Heatmaps for delivery locations

## 🛣️ API Integration

### Order Service
```typescript
// Get orders for delivery partner
const orders = await orderService.getDeliveryPartnerOrders(partnerId);

// Update order status
await orderService.updateOrderStatus(orderId, 'delivered');
```

### Authentication Service
```typescript
// User login
const { user, token } = await authService.login(credentials);

// Get current user
const user = authService.getUser();
```

## 🎨 Component Architecture

### Key Components:
- **CreateOrderForm**: Modal form for order creation
- **DeliveryMap**: Interactive map with real-time tracking
- **DeliveryAnalytics**: Charts and metrics dashboard
- **Order Cards**: Reusable order display components

### Design System:
- **Consistent Styling**: Tailwind CSS utility classes
- **Component Library**: shadcn/ui for consistent UI
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation

## 🚀 Deployment

### Build for Production
```bash
npm run build
# or
yarn build
```

### Environment Variables for Production
Ensure all environment variables are configured in your deployment platform:
- Mapbox access token
- Backend API URLs
- Socket.IO server configuration

### Deployment Platforms
- **Vercel**: Optimized for React applications
- **Netlify**: Static site hosting with form handling
- **AWS S3 + CloudFront**: Scalable static hosting
- **Lovable**: One-click deployment (recommended)

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strong typing for all components
- **ESLint**: Code linting and formatting
- **Component Structure**: Functional components with hooks
- **State Management**: React Query for server state, local state for UI

### Adding New Features
1. **Create Components**: Small, focused components
2. **Type Definitions**: Add TypeScript interfaces
3. **Service Integration**: Update relevant services
4. **Testing**: Test new functionality thoroughly

### Best Practices
- **Separation of Concerns**: Keep business logic in services
- **Reusable Components**: Create modular UI components
- **Error Handling**: Graceful error handling with toasts
- **Performance**: Optimize with React.memo and useMemo when needed

## 🔒 Security Considerations

- **Authentication**: JWT-based authentication
- **Role-based Access**: Route protection based on user roles
- **Data Validation**: Client and server-side validation
- **Location Privacy**: Location data only shared during active deliveries

## 🐛 Troubleshooting

### Common Issues:

#### Map Not Loading
- Verify Mapbox access token in environment variables
- Check network connectivity
- Ensure token has proper scopes

#### Real-time Features Not Working
- Verify Socket.IO server is running
- Check WebSocket connection in browser dev tools
- Confirm CORS settings on backend

#### Build Errors
- Clear node_modules and reinstall dependencies
- Check TypeScript errors in terminal
- Verify all imports are correct

## 📱 Mobile Support

- **Responsive Design**: Works on all screen sizes
- **Touch-friendly**: Optimized for mobile interactions
- **PWA Ready**: Can be installed as a mobile app
- **Geolocation**: Native mobile GPS integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- **Mapbox** for excellent mapping services
- **shadcn/ui** for beautiful component library
- **Socket.IO** for real-time communication
- **Recharts** for data visualization
- **Lovable** for the development platform

---


