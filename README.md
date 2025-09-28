# MIT Media Lab Chat Study

A research study interface for conducting chat-based experiments using Claude AI, deployed on Vercel for serverless performance and security.

## 🚀 Quick Start

### Deploy to Vercel (Recommended)

1. **Fork or clone this repository**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Deploy with one click

3. **Set up environment variables**:
   - In Vercel dashboard: Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = your Anthropic API key
   - Redeploy the project

4. **Access your study**: Your study will be live at `https://your-project.vercel.app`

### Local Development

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Clone and setup**: 
   ```bash
   git clone <your-repo>
   cd mech-chat-iui
   vercel dev
   ```
3. **Set environment variable**: `vercel env add ANTHROPIC_API_KEY`
4. **Access locally**: `http://localhost:3000`

## 📋 Features

- **Serverless Architecture**: Deployed on Vercel with automatic scaling
- **Secure API Handling**: API keys stored server-side, never exposed to frontend
- **Modern Chat Interface**: Clean, responsive design inspired by Open WebUI
- **Research-Ready**: Built for academic studies with consent flow and data collection
- **Firebase Integration**: Optional data collection and analytics
- **Mobile Responsive**: Works on all devices

## 🏗️ Architecture

### Frontend
- **Static Files**: HTML, CSS, JavaScript served from Vercel CDN
- **Framework**: Vanilla JavaScript with jQuery
- **Styling**: Custom CSS with modern design system
- **Responsive**: Mobile-first design

### Backend
- **Serverless Function**: `/api/claude` handles Claude API calls
- **Security**: API key stored in environment variables
- **CORS**: Properly configured for frontend requests
- **Error Handling**: Comprehensive error management

### Data Flow
```
User Input → Frontend → /api/claude → Anthropic API → Response → Frontend → User
```

## 📁 Project Structure

```
├── index.html                 # Main application entry point
├── api/
│   └── claude.js             # Serverless function for Claude API
├── js/
│   ├── config-unified.js     # Unified configuration (Vercel + local)
│   ├── chat.js              # Chat interface logic
│   ├── consent.js           # Consent form handling
│   ├── metadata.js          # Study metadata
│   └── firebasepsych1.1.js  # Firebase integration
├── html/
│   ├── consent.html         # Consent page
│   └── chat-content.html    # Chat interface
├── css/
│   └── consent.css          # Consent page styles
├── images/
│   └── ml_logo.png          # MIT Media Lab logo
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
└── VERCEL_DEPLOYMENT.md     # Detailed deployment guide
```

## ⚙️ Configuration

### Environment Variables
- `ANTHROPIC_API_KEY`: Your Anthropic API key (required)

### API Configuration
The application automatically detects the environment:
- **Vercel Production**: Uses serverless function (no frontend API key needed)
- **Local Development**: Falls back to CORS proxies (API key required)

### Customization
- **Study Title**: Edit `#experiment-title` in `index.html`
- **Chat System Prompt**: Modify in `js/chat.js`
- **Styling**: Update CSS variables in `index.html`
- **Firebase**: Configure in `js/firebasepsych1.1.js`

## 🔧 Development

### Prerequisites
- Node.js 18+ (for Vercel CLI)
- Anthropic API key
- Git

### Local Setup
1. Clone the repository
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel dev` for local development
4. Set environment variables as needed

### Testing
- Test locally with `vercel dev`
- Test production deployment
- Verify API functionality
- Check mobile responsiveness

## 📊 Research Features

### Consent Management
- IRB-compliant consent flow
- Participant information display
- Consent tracking

### Data Collection
- Optional Firebase integration
- Conversation logging
- Participant analytics
- Export capabilities

### Study Flow
1. **Consent Page**: Participant agreement
2. **Instructions**: Study guidelines
3. **Chat Interface**: Main experiment
4. **Survey**: Optional post-study questions
5. **Completion**: Thank you and next steps

## 🚀 Deployment Options

### Vercel (Recommended)
- **Pros**: Serverless, secure, fast, free tier
- **Setup**: Connect GitHub repo, add API key, deploy
- **Cost**: Free for research studies

### Other Platforms
- **Netlify**: Similar to Vercel, good alternative
- **GitHub Pages**: Static only, requires CORS proxies
- **AWS/GCP**: More complex but more control

## 🔒 Security

### API Key Protection
- Stored in Vercel environment variables
- Never exposed to frontend
- Encrypted at rest

### Data Privacy
- No data stored on frontend
- Optional Firebase for research data
- GDPR compliant design

### CORS Security
- Properly configured for your domain
- No wildcard origins
- Secure headers

## 📈 Performance

### Vercel Benefits
- **Global CDN**: Fast loading worldwide
- **Serverless**: Automatic scaling
- **Edge Functions**: Low latency
- **Caching**: Optimized delivery

### Optimization
- Minified assets
- Optimized images
- Efficient API calls
- Responsive design

## 🐛 Troubleshooting

### Common Issues

#### API Not Working
- Check environment variables in Vercel
- Verify API key is valid
- Check function logs in Vercel dashboard

#### CORS Errors
- Should not occur with Vercel deployment
- Check API route configuration
- Verify frontend is making correct requests

#### Build Failures
- Check `package.json` dependencies
- Verify `vercel.json` configuration
- Review build logs

### Getting Help
- Check [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed guide
- Review Vercel documentation
- Check browser console for errors
- Contact Vercel support for platform issues

## 📚 Documentation

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Detailed deployment guide
- [API_KEY_SETUP.md](API_KEY_SETUP.md) - API key configuration
- [SECURE_DEPLOYMENT.md](SECURE_DEPLOYMENT.md) - Security best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🏛️ MIT Media Lab

This project is developed for research at the MIT Media Lab. For questions about the study or research purposes, please contact the study administrators.

---

**Ready to deploy?** Follow the [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md) to get started!
