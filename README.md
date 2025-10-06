# RFP Application - AI-Powered Proposal Management Platform

A comprehensive web application designed to streamline the Request for Proposal (RFP) and Grant proposal process using AI-powered intelligence, smart templates, and comprehensive proposal management tools.

## 🚀 Features

### Core Features
- **AI RFP Discovery**: Find relevant RFPs matched to your business capabilities
- **AI Grant Discovery**: Discover grant opportunities with AI-powered recommendations
- **Smart Proposal Generation**: AI-powered proposal creation with dynamic templates
- **Compliance Checking**: Automated compliance verification against RFP requirements
- **Real-time Proposal Monitoring**: Monitor all your proposals in one centralized dashboard
- **Team Collaboration**: Role-based access control for companies, editors, and viewers
- **Calendar Integration**: Visual calendar view for proposal deadlines and events
- **PDF Generation**: Export proposals and reports to PDF format
- **Payment Integration**: Stripe-powered subscription management
- **Support System**: Built-in ticket system for customer support

### User Roles
- **Company**: Full access to all features including team management
- **Editor**: Can create and edit proposals, manage team members
- **Viewer**: Read-only access to proposals and data
- **SuperAdmin**: System administration and user management

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing with protected routes
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **React Icons** - Comprehensive icon library
- **Lucide React** - Modern icon components
- **Axios** - HTTP client for API calls

### UI/UX Libraries
- **React Toastify** - Toast notifications
- **SweetAlert2** - Beautiful alert dialogs
- **React Big Calendar** - Calendar component with moment.js
- **React PDF** - PDF viewing capabilities
- **React Phone Input 2** - International phone number input

### Payment & Communication
- **Stripe** - Payment processing and subscription management
- **EmailJS** - Email service integration
- **JWT Decode** - Token management

### Utilities
- **Moment.js** - Date manipulation and formatting
- **Pako** - Data compression utilities
- **HTML2PDF.js** - PDF generation from HTML
- **LibPhoneNumber** - Phone number validation

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **TypeScript Types** - Type definitions for React

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** package manager
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rfp-app-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=https://proposal-form-backend.vercel.app/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 📁 Project Structure

```
rfp-app-new/
├── public/                     # Static assets and images
│   ├── dashboard-bg.png
│   ├── homepage.png
│   ├── Login.png
│   ├── Sign_Up.png
│   └── ...                     # Other static assets
├── src/
│   ├── assets/                 # Static assets (logos, icons)
│   │   ├── Contact.png
│   │   └── superAdmin/         # Super admin specific assets
│   ├── components/             # Reusable React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── discover/           # Discovery page components
│   │   ├── forms/              # Form components
│   │   ├── layout/             # Layout components
│   │   ├── payment/            # Payment-related components
│   │   ├── profile/            # Profile management components
│   │   ├── proposals/          # Proposal-related components
│   │   ├── superadmin/         # Super admin components
│   │   ├── support/            # Support system components
│   │   ├── ui/                 # UI components
│   │   ├── ErrorBoundary.jsx
│   │   ├── GrantProposalForm.jsx
│   │   ├── Generate_Word.jsx
│   │   ├── PaymentButton.jsx
│   │   ├── PaymentNavigation.jsx
│   │   ├── PhoneNumberInput.jsx
│   │   └── Subscription.jsx
│   ├── config/                 # Configuration files
│   │   └── stripe.js           # Stripe configuration
│   ├── context/                # React Context providers
│   │   ├── EmployeeProfileContext.jsx
│   │   ├── JWTVerifier.jsx
│   │   ├── ProfileContext.jsx
│   │   ├── SubscriptionPlansContext.jsx
│   │   └── UserContext.jsx
│   ├── pages/                  # Main application pages
│   │   ├── admin/              # Admin pages
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── profile/            # Profile pages
│   │   ├── proposals/          # Proposal pages
│   │   ├── AdvancedComplianceCheck.jsx
│   │   ├── BasicComplianceCheck.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── CompanyProfileDashboard.jsx
│   │   ├── CompanyProfileUpdate.jsx
│   │   ├── Compliance.jsx
│   │   ├── Contact.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Discover.jsx
│   │   ├── EmployeeProfileDashboard.jsx
│   │   ├── EmployeeProfileUpdate.jsx
│   │   ├── Footer.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── GenerateProposalPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── Navbar.jsx
│   │   ├── NavbarComponent.jsx
│   │   ├── ProfileForm.jsx
│   │   ├── Proposals.jsx
│   │   ├── ProtectedRoutes.jsx
│   │   ├── SignUpPage.jsx
│   │   ├── StripePaymentPage.jsx
│   │   ├── SupportTicket.jsx
│   │   └── ToastContainer.jsx
│   ├── Super_Admin/            # Super admin functionality
│   │   └── SuperAdmin.jsx
│   ├── utils/                  # Utility functions
│   │   ├── compression.js      # Data compression utilities
│   │   └── sanitization.js     # Data sanitization utilities
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
├── vercel.json                 # Vercel deployment configuration
└── README.md                   # Project documentation
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
VITE_API_BASE_URL=https://proposal-form-backend.vercel.app/api
```

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

### Vite
Build tool configuration is in `vite.config.js` with React plugin enabled.

### ESLint
Code linting rules are configured in `eslint.config.js`.

## 🌐 API Integration

The application integrates with a backend API for:
- User authentication and authorization
- RFP and Grant data management
- Proposal creation and storage
- AI-powered features
- Payment processing
- Support ticket management

**Base URL**: `https://proposal-form-backend.vercel.app/api`

### Key Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/forgotPassword` - Password reset
- `GET /rfp/getAllRFP` - Fetch RFP data
- `GET /getOtherRFPs` - Get additional RFPs
- `POST /proposals/createProposal` - Create new proposal
- `POST /rfp/sendDataForProposalGeneration` - AI proposal generation
- `POST /saveRFP` - Save RFP for later
- `POST /uploadRFP` - Upload RFP documents
- `GET /getDashboardData` - Dashboard data
- `POST /tickets` - Support ticket management

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with responsive layouts
- **Modern Interface**: Clean, professional design with intuitive navigation
- **Interactive Elements**: Hover effects, transitions, and smooth animations
- **Role-based Navigation**: Different navigation based on user roles
- **Loading States**: Proper loading indicators and error boundaries
- **Toast Notifications**: User-friendly feedback system
- **Modal Dialogs**: Beautiful confirmation and form dialogs

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Tokens) for authentication:
- Secure login/signup process with email verification
- Token-based session management
- Protected routes with role-based access control
- Password reset functionality
- Profile management for different user types

### User Roles & Permissions
- **Company**: Full access to all features, team management
- **Editor**: Create/edit proposals, manage team members
- **Viewer**: Read-only access to proposals and data
- **SuperAdmin**: System administration, user management, analytics

## 📊 Key Features

### RFP & Grant Discovery
- AI-powered search and filtering
- Save/bookmark functionality
- Upload custom RFP documents
- Recommendation engine

### Proposal Management
- AI-powered proposal generation
- Template-based creation
- Real-time collaboration
- Version control and history

### Compliance & Analytics
- Automated compliance checking
- Win probability scoring
- Performance analytics
- Dashboard with key metrics

### Team Collaboration
- Role-based access control
- Team member management
- Shared workspaces
- Activity tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any static hosting platform:
- Netlify
- AWS S3 + CloudFront
- Google Cloud Storage
- GitHub Pages

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input sanitization and validation
- Protected API endpoints
- Secure payment processing with Stripe
- Email verification for new accounts

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Use the built-in support ticket system
- Create an issue in the GitHub repository
- Contact the development team

## 🔮 Roadmap

### Planned Features
- [ ] Advanced AI proposal generation with GPT integration
- [ ] Real-time collaboration tools
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] API rate limiting and caching
- [ ] Multi-language support
- [ ] Advanced PDF editing features
- [ ] Integration with CRM systems
- [ ] Automated proposal scoring
- [ ] Team performance metrics

### Performance Improvements
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Caching strategies
- [ ] Progressive Web App (PWA) features

---

**Built with ❤️ using React, Vite, and modern web technologies**

## 📞 Contact

For any questions or support, please reach out through the application's support system or create an issue in the repository.