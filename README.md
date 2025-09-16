# RFP Application - AI-Powered Proposal Management Platform

A modern, full-stack web application designed to streamline the Request for Proposal (RFP) process using AI-powered intelligence, smart templates, and comprehensive proposal management tools.

## 🚀 Features

### Core Features
- **AI RFP Discovery**: Find relevant RFPs matched to your business capabilities
- **Smart Templates**: Industry-specific templates with AI-powered customization
- **Compliance Check**: Automated compliance verification against RFP requirements
- **Win Probability Score**: AI-powered scoring system to predict proposal success
- **Real-time Proposal Monitoring**: Monitor all your proposals in one place
- **Team Collaboration Tools**: Work together seamlessly with your team
- **Performance Analytics**: Data-driven insights for better decisions
- **PDF Editor**: Advanced PDF editing and generation capabilities

### Key Benefits
- **DISCOVER**: AI-powered search and personalized RFP recommendations
- **GENERATE**: Build compelling proposals with dynamic templates and AI enhancements
- **COLLABORATE**: Live co-editing, threaded comments, and version control
- **ANALYZE**: Instant compliance checks and error detection
- **MANAGE**: Real-time proposal tracking and lifecycle management

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Redux Toolkit** - State management with RTK
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **React Quill** - Rich text editor
- **React PDF** - PDF viewing and manipulation
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API calls

### PDF & Document Processing
- **Fabric.js** - Canvas manipulation for PDF editing
- **PDF-lib** - PDF creation and manipulation
- **jsPDF** - PDF generation
- **html2pdf.js** - HTML to PDF conversion
- **PDF.js** - PDF rendering and parsing

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rfp-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=https://proposal-form-backend.vercel.app/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 📁 Project Structure

```
rfp-app/
├── public/                 # Static assets and images
├── src/
│   ├── assets/            # Static assets (logos, icons)
│   ├── features/          # Redux slices and state management
│   ├── pages/             # React components and pages
│   │   ├── HomePage.jsx           # Landing page
│   │   ├── LoginPage.jsx          # User authentication
│   │   ├── SignUpPage.jsx         # User registration
│   │   ├── ProfilePage.jsx        # User profile management
│   │   ├── CreateProposalPage.jsx # Proposal creation
│   │   ├── EditProposalPage.jsx   # Proposal editing
│   │   ├── RFPDiscovery.jsx       # RFP search and discovery
│   │   ├── GenerateProposalPage.jsx # AI proposal generation
│   │   ├── PdfEditor.jsx          # PDF editing capabilities
│   │   └── ...                   # Other components
│   ├── store/             # Redux store configuration
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Project documentation
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

### Vite
Build tool configuration is in `vite.config.js` with React plugin enabled.

### ESLint
Code linting rules are configured in `eslint.config.js`.

## 🌐 API Integration

The application integrates with a backend API for:
- User authentication and authorization
- RFP data management
- Proposal creation and storage
- AI-powered features

**Base URL**: `https://proposal-form-backend.vercel.app/api`

### Key Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /rfp/getAllRFP` - Fetch RFP data
- `POST /proposals/createProposal` - Create new proposal

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with responsive layouts
- **Modern Interface**: Clean, professional design with intuitive navigation
- **Interactive Elements**: Hover effects, transitions, and smooth animations
- **Accessibility**: WCAG compliant design patterns
- **Dark/Light Mode**: Theme support (planned feature)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Secure login/signup process
- Token-based session management
- Protected routes and API endpoints
- Automatic token refresh (planned)

## 📊 State Management

Redux Toolkit is used for global state management:
- User authentication state
- Proposal data management
- RFP discovery and filtering
- Application settings

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any static hosting platform:
- Netlify
- AWS S3 + CloudFront
- Google Cloud Storage
- GitHub Pages

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
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## 🔮 Roadmap

### Planned Features
- [ ] Advanced AI proposal generation
- [ ] Real-time collaboration tools
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] API rate limiting and caching
- [ ] Multi-language support
- [ ] Advanced PDF editing features
- [ ] Integration with third-party services

### Performance Improvements
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Caching strategies

---

**Built with ❤️ using React, Vite, and modern web technologies**
