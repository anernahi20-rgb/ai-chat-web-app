# 🤖 AI Chat Web App

> A powerful client-side AI chat application using Transformers.js - No API keys required!

[![Deploy Status](https://github.com/anernahi20-rgb/ai-chat-web-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/anernahi20-rgb/ai-chat-web-app/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=flat-square)](https://anernahi20-rgb.github.io/ai-chat-web-app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🧠 **Client-Side AI**: Powered by [Transformers.js](https://huggingface.co/docs/transformers.js) - runs entirely in your browser
- 🔐 **100% Private**: No data sent to servers, all processing happens locally
- 🚫 **No API Keys**: Completely free to use, no registration required
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🌐 **Offline Ready**: Works without internet after initial model download
- ⚡ **Multiple Models**: Choose from different AI models based on your needs
- 🎨 **Modern UI**: Clean, intuitive interface with dark mode support
- 🔄 **Auto-Deploy**: Automatically deploys to GitHub Pages via GitHub Actions

## 🚀 Live Demo

**[Try it now →](https://anernahi20-rgb.github.io/ai-chat-web-app/)**

## 🤖 Available AI Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **DistilGPT-2** | 82MB | ⚡ Fast | Good | Quick responses, low bandwidth |
| **GPT-2** | 548MB | Medium | Better | Higher quality conversations |
| **SmolLM-135M** | 268MB | Fast | Great | Instruction-following tasks |
| **DialoGPT-Small** | 117MB | Fast | Good | Conversational chat |

## 🛠 Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI Engine**: [Transformers.js](https://huggingface.co/docs/transformers.js) by Hugging Face
- **Models**: Pre-trained models from Hugging Face Hub
- **Deployment**: GitHub Pages with GitHub Actions
- **PWA**: Service Worker for offline functionality
- **Styling**: Modern CSS with CSS Custom Properties

## 📋 Prerequisites

- Modern web browser with JavaScript enabled
- WebAssembly support (available in all modern browsers)
- For better performance: WebGPU support (Chrome/Edge 113+, Firefox with flag)

## 🏃‍♂️ Quick Start

### Option 1: Use the Live Demo
Simply visit [https://anernahi20-rgb.github.io/ai-chat-web-app/](https://anernahi20-rgb.github.io/ai-chat-web-app/)

### Option 2: Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anernahi20-rgb/ai-chat-web-app.git
   cd ai-chat-web-app
   ```

2. **Serve the files** (required due to CORS policies):
   
   **Using Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Using Node.js:**
   ```bash
   npx http-server -p 8000
   ```
   
   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser:**
   Navigate to `http://localhost:8000`

### Option 3: Deploy Your Own

1. Fork this repository
2. Go to your repository Settings → Pages
3. Set Source to "GitHub Actions"
4. The workflow will automatically deploy your app

## 🎯 How to Use

1. **First Visit**: The app will automatically load the DistilGPT-2 model (82MB)
2. **Choose a Model**: Select different models from the dropdown for various capabilities
3. **Start Chatting**: Type your message and press Enter or click Send
4. **Model Loading**: First-time model downloads are cached for offline use
5. **Enjoy**: Have conversations with AI entirely in your browser!

## 🔧 Configuration

### Changing Default Model
Edit `script.js` and modify the default model:
```javascript
this.currentModel = 'Xenova/distilgpt2'; // Change this line
```

### Adding New Models
1. Add the model to the dropdown in `index.html`
2. Update the model display names in `script.js`
3. Ensure the model is compatible with Transformers.js

### Customizing Appearance
Modify CSS custom properties in `style.css`:
```css
:root {
    --primary-color: #667eea; /* Change primary color */
    --secondary-color: #764ba2; /* Change secondary color */
    /* ... other variables */
}
```

## 📁 Project Structure

```
ai-chat-web-app/
├── index.html          # Main HTML file
├── style.css           # Styling and responsive design
├── script.js           # Main application logic
├── sw.js              # Service worker for offline functionality
├── manifest.json      # PWA manifest (auto-generated)
├── .github/
│   └── workflows/
│       └── deploy.yml # GitHub Actions deployment workflow
└── README.md          # This file
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Improve code, fix bugs, add features
4. **Test thoroughly**: Ensure everything works across different browsers
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes and why they're needed

### Development Guidelines

- Follow existing code style and conventions
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Ensure mobile responsiveness
- Keep accessibility in mind
- Document any new features

## 🐛 Troubleshooting

### Common Issues

**Model not loading:**
- Check your internet connection for first-time downloads
- Clear browser cache and reload
- Try a different model

**Slow performance:**
- Use DistilGPT-2 for faster responses
- Enable WebGPU in your browser if available
- Close other resource-intensive tabs

**CORS errors when running locally:**
- Always serve files through a local server (see Quick Start)
- Don't open `index.html` directly in browser

**Service Worker issues:**
- Clear browser data and reload
- Check browser console for errors
- Disable and re-enable service worker

## 📊 Browser Compatibility

| Browser | Version | WebAssembly | WebGPU | Status |
|---------|---------|-------------|--------|--------|
| Chrome | 57+ | ✅ | 113+ | ✅ Fully Supported |
| Firefox | 52+ | ✅ | Flag | ✅ Supported |
| Safari | 11+ | ✅ | ❌ | ✅ Supported |
| Edge | 16+ | ✅ | 113+ | ✅ Fully Supported |

## 🔒 Privacy & Security

- **No Data Collection**: Nothing is sent to external servers
- **Local Processing**: All AI inference happens in your browser
- **No Cookies**: No tracking or analytics
- **Open Source**: Full transparency - inspect the code yourself
- **HTTPS Only**: Secure connections in production

## 📈 Performance Tips

1. **Use WebGPU**: Enable in Chrome/Edge for GPU acceleration
2. **Model Selection**: Choose smaller models for faster responses
3. **Browser Optimization**: 
   - Close unnecessary tabs
   - Ensure sufficient RAM (2GB+ recommended)
   - Use latest browser versions
4. **Network**: Good connection needed for initial model download

## 🔮 Roadmap

- [ ] Voice input/output capabilities
- [ ] More model options (vision, audio)
- [ ] Conversation export/import
- [ ] Custom model upload
- [ ] Advanced prompt templates
- [ ] Multi-language support
- [ ] Plugin system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for Transformers.js and model hosting
- [Xenova](https://github.com/xenova) for the amazing Transformers.js library
- [Font Awesome](https://fontawesome.com/) for beautiful icons
- The open-source community for inspiration and support

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/anernahi20-rgb/ai-chat-web-app/issues) page
2. Create a new issue with detailed information
3. Join discussions in the repository

---

**⭐ If you found this project helpful, please give it a star!**

**🔗 Share it with others who might benefit from client-side AI!**

---

<div align="center">
  <strong>Built with ❤️ using Transformers.js</strong>
  <br>
  <sub>Making AI accessible to everyone, everywhere</sub>
</div>