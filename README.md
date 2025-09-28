# nailXpress V2 🎨

**AI-Powered Nail Artist Discovery Platform**

nailXpress V2 is a modern, AI-powered platform that connects clients with nail artists based on style preferences and location. Upload your nail inspiration photos and let our AI match you with nearby artists who specialize in your exact style.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Style Matching**: Upload inspiration photos and get matched with artists who specialize in your style
- **Artist Self-Service Portal**: Artists can create profiles, upload portfolios, and manage their listings
- **Advanced Search & Filtering**: Filter by location, style, and artist specialties
- **Modern Responsive UI**: Beautiful, mobile-first design with Tailwind CSS
- **Secure Authentication**: Firebase Auth with email and Google login options

### 🤖 AI Integration
- **CLIP Model Analysis**: Advanced image analysis using Replicate API
- **Style Detection**: Automatically identify nail art styles and techniques
- **Smart Matching**: AI-powered artist recommendations based on style compatibility
- **Confidence Scoring**: Transparent matching confidence levels

### 🗺️ Location Features
- **Location-Based Discovery**: Find artists in your area
- **Google Maps Integration**: Visual artist location mapping
- **Popular Location Quick-Search**: One-click location filtering

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management
- **React Query** for data fetching

### Backend
- **Firebase Authentication** for user management
- **Cloud Firestore** for data storage
- **Firebase Storage** for image uploads
- **Replicate API** for AI model integration

### AI Services
- **CLIP Model** for image analysis
- **Custom matching algorithms** for artist recommendations
- **Style classification** and feature extraction

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup
- Replicate API account (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nailxpress-v2.git
   cd nailxpress-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   REACT_APP_REPLICATE_API_TOKEN=your_replicate_token_here
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ArtistCard.js
│   ├── ImageUploadModal.js
│   ├── Navbar.js
│   ├── Footer.js
│   └── ProtectedRoute.js
├── contexts/           # React Context providers
│   ├── AuthContext.js
│   └── ArtistContext.js
├── pages/             # Page components
│   ├── Home.js
│   ├── Artists.js
│   ├── ArtistProfile.js
│   ├── ArtistDashboard.js
│   ├── Login.js
│   └── Signup.js
├── services/          # API and external services
│   └── aiService.js
├── styles/            # CSS files
│   └── Home.css
├── firebase.js        # Firebase configuration
├── auth.js           # Authentication utilities
└── App.js            # Main app component
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Enable Storage
5. Update `src/firebase.js` with your config

### AI Service Setup
1. Sign up for Replicate API
2. Get your API token
3. Add to environment variables
4. Configure model settings in `src/services/aiService.js`

## 🎨 Key Components

### Artist Dashboard
- Profile management
- Portfolio upload
- Style specialization
- Location settings

### AI Image Analysis
- Drag & drop image upload
- Real-time style detection
- Artist matching algorithm
- Confidence scoring

### Search & Discovery
- Advanced filtering
- Location-based search
- Style-based matching
- Artist recommendations

## 🧪 Testing

### Manual Testing
- User registration and login
- Artist profile creation
- Image upload and AI analysis
- Search and filtering functionality

### API Testing
- Firebase Authentication flows
- Firestore data operations
- Image upload to Firebase Storage
- AI service integration

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Environment Variables
Ensure all environment variables are set in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Artist profile system
- ✅ AI image analysis
- ✅ Search and filtering
- ✅ Modern UI/UX

### Phase 2 (Future)
- [ ] Booking system integration
- [ ] Payment processing
- [ ] Review and rating system
- [ ] Advanced AI features
- [ ] Mobile app development

## 📞 Support

For support, email support@nailxpress.com or create an issue in this repository.

---
**Built with ❤️ by the nailXpress team**
