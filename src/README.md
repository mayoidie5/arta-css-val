# Valenzuela CSS PWA - Customer Satisfaction Survey

<div align="center">

![Status](https://img.shields.io/badge/Status-Frontend_Complete-brightgreen)
![Firebase](https://img.shields.io/badge/Backend-Firebase_Ready-orange)
![ARTA](https://img.shields.io/badge/ARTA-Compliant-blue)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple)

**A modern, ARTA-compliant Progressive Web Application for the City Government of Valenzuela's Customer Satisfaction Survey**

</div>

---

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

**Default Admin Login (Mock):**
- Email: `admin@valenzuela.gov.ph`
- Password: `admin123`

---

## 📋 Project Overview

This PWA digitizes the City Government of Valenzuela's paper-based Customer Satisfaction Survey system, featuring:

- 🏛️ **Government-grade design** - Professional blue color palette, clean interface
- 📱 **Mobile-first** - Fully responsive, works on all devices
- 🖥️ **Kiosk mode** - Optimized for public touch screen displays
- 📊 **Real-time analytics** - Dashboard with charts and insights
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🔒 **Secure** - Firebase-ready with security rules template
- ⚡ **Fast** - Optimized performance, smooth animations

---

## ✨ Key Features

### **For Citizens**
- ✅ Quick 5-7 minute survey
- ✅ Anonymous or with optional email
- ✅ ARTA-compliant Likert scale (5-point + N/A)
- ✅ Instant reference ID (CSS-YYYYMMDD-XXXXX)
- ✅ Mobile and desktop friendly
- ✅ Touch-optimized for kiosks

### **For Administrators**
- ✅ Real-time analytics dashboard
- ✅ Manage survey questions (add, edit, delete, reorder)
- ✅ View all responses with search
- ✅ Export data to CSV
- ✅ User management (roles: Admin, Staff, Viewer)
- ✅ Kiosk mode configuration
- ✅ Landscape/Portrait orientation settings
- ✅ QR code generation

---

## 🖥️ Kiosk Mode

Perfect for public displays and touch screen kiosks:

### **Features**
- 🎨 **Custom landing screen** - Interactive welcome with large touch targets
- 🔄 **Orientation support** - Landscape (horizontal) or Portrait (vertical)
- 🖱️ **Touch-optimized** - Large buttons, smooth animations
- 🔒 **Admin access hidden** - Public users can't access admin panel
- ⌨️ **Emergency exit** - Ctrl+Shift+K to disable kiosk mode

### **Landscape Mode** 🖥️
Best for: Reception desks, conference rooms, lobbies
- Wide form layout (max 768px)
- All 6 Likert options in one row
- Minimal scrolling

### **Portrait Mode** 📱
Best for: Wall-mounted tablets, standing kiosks, entrance displays
- Narrow form layout (max 576px)
- Stacked Likert buttons (2-3 columns)
- Vertical scrolling optimized

---

## 📁 Project Structure

```
/
├── App.tsx                           # Main application with routing
├── README.md                         # This file
├── FRONTEND_COMPLETE.md              # Detailed frontend documentation
├── FIREBASE_INTEGRATION_GUIDE.md     # Complete Firebase setup guide
├── FIREBASE_PWA_INTEGRATION_GUIDE.md # Firebase + PWA integration guide
├── TESTING_GUIDE.md                  # Comprehensive testing checklist
│
├── /components/
│   ├── LandingPage.tsx               # Public landing page
│   ├── KioskLandingScreen.tsx        # Kiosk mode welcome screen
│   ├── SurveyForm.tsx                # Main survey with progress tracking
│   ├── AdminDashboard.tsx            # Admin panel with all features
│   ├── CustomDatePicker.tsx          # Date input component
│   ├── DraggableQuestionItem.tsx     # Drag-and-drop for questions
│   │
│   ├── /ui/                          # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── radio-group.tsx
│   │   ├── select.tsx
│   │   └── ... (all other UI)
│   │
│   └── /figma/
│       └── ImageWithFallback.tsx     # Image component with fallback
│
└── /styles/
    └── globals.css                   # Global styles & Tailwind config
```

---

## 🎨 Design System

### **Colors**
- **Primary Dark Blue** `#0D3B66` - Headers, primary buttons
- **Accent Blue** `#3FA7D6` - CTAs, links, interactive elements
- **Light Gray** `#F5F9FC` - Backgrounds
- **White** `#FFFFFF` - Cards, content areas

### **Components**
- **Shadcn UI** - Accessible component library
- **Lucide Icons** - Modern icon set
- **Motion/React** - Smooth animations
- **Recharts** - Data visualization

---

## 📊 Data Structure

### **Survey Response**
```typescript
{
  id: number;
  refId: string;          // CSS-20251120-00001
  date: string;           // 2025-11-20
  clientType: string;     // citizen/business/government
  sex: string;            // male/female
  age: string;
  region: string;         // NCR, CAR, etc. (17 regions)
  service: string;
  cc1-3: string;          // Client feedback (Likert 1-5 or 'na')
  sqd0-8: string;         // Service quality (Likert 1-5 or 'na')
  sqdAvg: number;         // Average SQD score
  suggestions: string;
  email: string;
  timestamp: number;
}
```

### **Survey Question**
```typescript
{
  id: string;             // cc1, sqd0, etc.
  text: string;           // Question text
  type: string;           // Likert, Radio, Text
  required: boolean;
  category: string;       // CC or SQD
  order: number;
}
```

---

## 🔥 Firebase Integration

### **Status: Ready for Backend**

The frontend is **100% complete** and structured for Firebase integration.

### **What's Provided**
✅ Complete Firestore data structure
✅ Security rules template
✅ Authentication setup guide
✅ Code templates for all operations
✅ Migration strategy
✅ Deployment checklist

### **Quick Start**
1. Read `FIREBASE_INTEGRATION_GUIDE.md`
2. Create Firebase project
3. Copy provided code templates
4. Connect Firestore + Authentication
5. Deploy! 🚀

**Estimated Integration Time:** 4-8 hours (with templates)

---

## 🧪 Testing

Comprehensive testing guide available in `TESTING_GUIDE.md`.

### **Test Coverage**
- ✅ 15 detailed test scenarios
- ✅ All user flows (public + admin)
- ✅ Responsive design (mobile to kiosk)
- ✅ Cross-browser compatibility
- ✅ Accessibility validation
- ✅ Performance benchmarks
- ✅ Firebase data structure verification

### **Key Tests**
1. Kiosk landing screen
2. Radio button animations
3. Orientation switching
4. Full survey flow
5. Admin CRUD operations
6. Real-time updates
7. Responsive breakpoints

---

## 🚀 Deployment Options

### **Firebase Hosting** (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
npm run build
firebase deploy
```

### **Other Options**
- Vercel
- Netlify
- GitHub Pages
- Any static hosting provider

---

## 📱 PWA Features (Ready)

- ✅ Manifest file for installability
- ✅ Service worker ready (add when deploying)
- ✅ Offline support capability
- ✅ App icon assets prepared
- ✅ "Add to Home Screen" prompt ready

---

## ♿ Accessibility

WCAG 2.1 AA Compliant:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Color contrast ratios
- ✅ ARIA labels
- ✅ Semantic HTML
- ✅ Touch target sizes (44x44px minimum)

---

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile | iOS Safari 14+, Chrome Mobile 90+ |

---

## 📦 Dependencies

### **Core**
- React 18
- TypeScript
- Tailwind CSS v4

### **UI & Animation**
- Shadcn UI (Radix primitives)
- Lucide React (icons)
- Motion/React (animations)

### **Features**
- Recharts (analytics)
- React DnD (drag-and-drop)
- React Hook Form (forms)
- Sonner (notifications)

---

## 🎓 Documentation

| Document | Description |
|----------|-------------|
| **README.md** | This file - quick overview |
| **FRONTEND_COMPLETE.md** | Detailed frontend documentation |
| **FIREBASE_INTEGRATION_GUIDE.md** | Complete backend setup |
| **FIREBASE_PWA_INTEGRATION_GUIDE.md** | Firebase + PWA integration guide |
| **TESTING_GUIDE.md** | Test scenarios and checklist |

---

## 🔒 Security

### **Current (Frontend)**
- ✅ Input validation
- ✅ XSS prevention
- ✅ Required field enforcement
- ✅ Mock authentication flow

### **Firebase-Ready**
- ✅ Security rules template provided
- ✅ Role-based access defined
- ✅ Authentication setup documented
- ✅ Data privacy guidelines

---

## 🎯 Current Status

### **✅ Completed**
- Frontend: 100% complete
- UI/UX: Polished and tested
- Responsive: All device sizes
- Animations: Smooth and optimized
- Documentation: Comprehensive
- Firebase prep: Ready for integration

### **🔜 Next Steps**
1. Set up Firebase project
2. Integrate backend (4-8 hours)
3. Test with real data
4. Deploy to production
5. Launch! 🚀

---

## 📊 Key Metrics

- **Components:** 20+ React components
- **Pages:** 3 main views (Landing, Survey, Admin)
- **Admin Features:** 6 sections (Dashboard, Responses, Analytics, Manage Questions, Users, Settings)
- **Survey Questions:** 3 CC + 9 SQD (customizable)
- **Responsive Breakpoints:** 4 (mobile, tablet, desktop, kiosk)
- **Animation Duration:** 300ms (smooth, not sluggish)
- **Touch Targets:** 44x44px minimum (accessible)

---

## 🏆 Features Highlights

### **Latest Updates** ⭐
- ✨ Smooth radio button animations (300ms, ease-out)
- ✨ Lighter borders for better UX
- ✨ Kiosk mode with landscape/portrait support
- ✨ Interactive kiosk landing screen
- ✨ Conditional orientation controls
- ✨ Real-time setting updates

### **Core Strengths**
- 🎨 Professional government aesthetic
- 📱 Mobile-first, fully responsive
- ⚡ Optimized performance
- ♿ WCAG 2.1 AA accessible
- 🔥 Firebase-ready architecture
- 📊 Real-time analytics
- 🖥️ Kiosk mode for public displays

---

## 💡 Usage Examples

### **For Development**
```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

### **For Testing**
```bash
# See TESTING_GUIDE.md for comprehensive test scenarios
# Manual testing recommended (UI-focused app)
```

### **For Firebase Integration**
```bash
# See FIREBASE_INTEGRATION_GUIDE.md
# Step-by-step guide with code templates provided
```

---

## 🙏 Credits

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI (Radix)
- **Icons:** Lucide React
- **Animations:** Motion/React
- **Charts:** Recharts

---

## 📞 Support

For questions about:
- **Frontend features:** See `FRONTEND_COMPLETE.md`
- **Testing:** See `TESTING_GUIDE.md`
- **Firebase setup:** See `FIREBASE_INTEGRATION_GUIDE.md`
- **General usage:** This README

---

## 🎉 Ready to Launch!

**Status:** ✅ **Frontend Complete - Ready for Firebase Integration**

The application is fully functional with mock data. Follow the Firebase integration guide to connect the backend and deploy to production.

### **Quick Checklist**
- [x] All features implemented
- [x] UI/UX polished
- [x] Responsive design verified
- [x] Documentation complete
- [x] Testing guide provided
- [x] Firebase-ready
- [ ] Backend integration (next step)
- [ ] Production deployment (after Firebase)

---

<div align="center">

**Built with ❤️ for the City Government of Valenzuela**

[View Documentation](./FRONTEND_COMPLETE.md) • [Firebase + PWA Guide](./FIREBASE_PWA_INTEGRATION_GUIDE.md) • [Testing Guide](./TESTING_GUIDE.md)

</div>

---

**Version:** 2.0 - Kiosk Mode Complete
**Last Updated:** November 20, 2025
**License:** Proprietary (City Government of Valenzuela)