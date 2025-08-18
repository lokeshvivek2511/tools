# DevTools Hub - All-in-One Developer Utility Toolbox

<img width="640" height="538" alt="image" src="https://github.com/user-attachments/assets/7846639d-69fd-4f54-acda-0c44d74bb192" />

## 🌟 Overview

DevTools Hub is an open-source, all-in-one developer utility toolbox designed to streamline your workflow with essential tools for everyday development tasks. Built with modern web technologies, this application offers a collection of powerful utilities in a clean, intuitive interface.

## 🚀 Features

- **API Tester**: REST API testing with request/response inspection
- **Color Palette Generator**: Extract colors from images and generate harmonious schemes
- **Diagram Generator**: Create diagrams from text using Mermaid syntax
- **Icon Generator**: Generate favicons and app icons in multiple sizes
- **Image Compressor**: Optimize images for web with quality control
- **Markdown Converter**: Live preview with Mermaid diagram support
- **Text Sharing**: Secure, temporary text sharing with encryption
- **Text Summarizer**: AI-powered text summarization

## 🛠️ Technologies Used

- **Frontend**: React, Vite, Tailwind CSS
- **UI**: Lucide React Icons, Framer Motion
- **Utilities**: Mermaid.js, Prism.js, Crypto-JS, JSZip, html2canvas
- **Build**: ESLint, Prettier, TypeScript

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lokeshvivek2511/tools.git

   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 📂 Project Structure

```
lokeshvivek2511-tools/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/             # Main tool pages
│   │   ├── ApiTester.jsx
│   │   ├── ColorPalette.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DiagramGenerator.jsx
│   │   ├── IconGenerator.jsx
│   │   ├── ImageCompressor.jsx
│   │   ├── MarkdownConverter.jsx
│   │   ├── TextSharing.jsx
│   │   └── TextSummarizer.jsx
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
└── vite.config.js         # Vite configuration
```

## 🎨 Design Philosophy

This project emphasizes:

- **Clean, intuitive interfaces** with thoughtful animations
- **Privacy-first approach** - most processing happens client-side
- **Responsive design** that works on all devices
- **Performance optimization** with code splitting and lazy loading

## 🤝 Contributing

DevTools Hub is **open for contributions**! Whether you want to:

- Add new tools
- Improve existing features
- Fix bugs
- Enhance the UI/UX

We welcome all contributions. Here's how to get started:

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🌍 Live Demo

Check out the live demo at [https://lokit.netlify.app](https://lokit.netlify.app)  

## 📸 Screenshots
<img width="1706" height="882" alt="image" src="https://github.com/user-attachments/assets/90609a1c-103d-49ad-b055-1a369db07fac" />
<img width="1821" height="858" alt="image" src="https://github.com/user-attachments/assets/0cf44479-5506-42e7-8271-46a33dc98737" />
<img width="1861" height="901" alt="image" src="https://github.com/user-attachments/assets/423bcc4a-0891-47a7-b8bc-a681d2415edd" />
<img width="1820" height="903" alt="image" src="https://github.com/user-attachments/assets/779f4398-bd37-4661-8ef2-f5526d935152" />
<img width="1826" height="901" alt="image" src="https://github.com/user-attachments/assets/fe2b47e7-9f10-4812-aa0d-f8c0e244bc78" />
<img width="1820" height="904" alt="image" src="https://github.com/user-attachments/assets/dccc9ca2-3ca8-4e3f-8958-56f624f5c56a" />
<img width="1838" height="884" alt="image" src="https://github.com/user-attachments/assets/f7ccb07e-5554-4cfe-ae98-ebd2ddcaa3be" />
<img width="1845" height="898" alt="image" src="https://github.com/user-attachments/assets/f32019a5-c0f9-4c35-879d-a05c029df81f" />


## 🙏 Acknowledgments

- Lucide React for beautiful icons
- Tailwind CSS for utility-first styling
- Vite for blazing fast development
- All open-source libraries that make this project possible

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Happy coding!** 🚀  
Feel free to fork, modify, and add your own tools to this growing collection of developer utilities.
