# 🚀 DevTab - Tasks & Notes Chrome Extension

A beautiful, responsive new tab extension for developers to manage tasks, take notes, and track workspaces with real-time sync.

![DevTab Preview](https://via.placeholder.com/800x400/10b981/ffffff?text=DevTab+Extension+Preview)

## ✨ Features

- **🕒 Digital Clock** - Beautiful live time display with theme-aware colors
- **📝 Task Management** - Create, organize, and track your daily tasks
- **🗂️ Multiple Workspaces** - Organize projects into separate workspaces
- **📖 Rich Notes** - Take detailed notes with a powerful editor
- **🔄 Real-time Sync** - Your data syncs across all devices with Firebase
- **📱 Responsive Design** - Perfect on desktop, tablet, and mobile
- **🎨 Theme Support** - Light and dark themes for comfortable viewing
- **⌨️ Keyboard Shortcuts** - Save with Cmd+S/Ctrl+S
- **📊 Quota Management** - Smart usage tracking for Firebase free tier
- **🔒 Privacy Focused** - Your data is encrypted and secure

## 🎯 Perfect for

- Developers and programmers
- Project managers
- Students and researchers
- Anyone who wants to stay organized

## 🚀 Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/devtab-extension.git
   cd devtab-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Load as Chrome extension**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production Build

```bash
npm run build:extension
```

This creates a `devtab-extension-v1.0.0.zip` file ready for Chrome Web Store submission.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Build Tool**: Vite
- **Editor**: Tiptap (ProseMirror-based)
- **Icons**: Lucide React
- **Date Handling**: Day.js

## 📱 Screenshots

| Desktop View | Mobile View | Dark Theme |
|-------------|-------------|------------|
| ![Desktop](https://via.placeholder.com/300x200/10b981/ffffff?text=Desktop) | ![Mobile](https://via.placeholder.com/300x200/10b981/ffffff?text=Mobile) | ![Dark](https://via.placeholder.com/300x200/1f2937/ffffff?text=Dark+Theme) |

## 🔧 Project Structure

```
devtab-extension/
├── public/
│   ├── manifest.json      # Chrome extension manifest
│   └── icons/            # Extension icons
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth, Theme, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Firebase and utilities
│   └── types.ts         # TypeScript definitions
├── store-assets/        # Chrome Web Store assets
└── dist/               # Built extension (gitignored)
```

## 🚀 Publishing to Chrome Web Store

1. **Create required assets**
   - Extension icons (16, 32, 48, 128px)
   - Screenshots (1280x800px)
   - Privacy policy

2. **Build and package**
   ```bash
   npm run build:extension
   ```

3. **Submit to Chrome Web Store**
   - Upload the generated ZIP file
   - Follow the comprehensive guide in `PUBLISHING_GUIDE.md`

## 🔒 Privacy & Security

- **No tracking**: We don't collect analytics or personal data
- **Local-first**: Works offline, data stored locally
- **Encrypted sync**: Firebase provides enterprise-grade security
- **Open source**: Transparent and auditable code

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/devtab-extension/issues)
- **Email**: narenkumar2001@gmail.com
- **Documentation**: See `PUBLISHING_GUIDE.md` for detailed setup

## 🌟 Roadmap

- [ ] Offline mode improvements
- [ ] Task scheduling and reminders
- [ ] Export/import functionality
- [ ] Team collaboration features
- [ ] Advanced theming options
- [ ] Widget customization

---

**Made with ❤️ for developers who love productivity**

Transform every new tab into a productive moment! ⚡
