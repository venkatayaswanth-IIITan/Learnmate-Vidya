<<<<<<< HEAD


# LearnMate Vidya – Fearless Learning with AI Agents 🚀

  GDG Agentathon 2025 Entry

## 🌟 About LearnMate Vidya

**LearnMate Vidya** is an AI-powered collaborative learning platform that transforms solitary study into dynamic, social simulations. Built for the GDG Agentathon 2025, our platform combines real-time video classrooms, interactive whiteboards, and intelligent AI moderation to create fearless learning environments.

**The name reflects our mission:**
- **LearnMate** – Your companion in the learning journey
- **Vidya** – Sanskrit for "knowledge" and "learning" 📚
- **AI Agents** – Intelligent assistants that facilitate and moderate learning

## 🚀 Our Mission

We aim to revolutionize group learning by creating safe, productive study environments where students can collaborate fearlessly. By integrating AI-driven moderation and real-time collaboration tools, LearnMate Vidya makes quality education accessible and engaging for everyone.

## 🏗️ Platform Features

### **Interactive Group Learning**
A comprehensive collaborative learning platform featuring:
- **Live Video Classrooms** – Real-time video conferencing with up to 10 participants
- **Shared Whiteboard** – Infinite canvas with LaTeX, code syntax highlighting, and freehand drawing
- **AI Moderation** – Intelligent conversation monitoring and guidance
- **Screen Sharing** – Seamless content sharing without interrupting video flow
- **Real-time Collaboration** – Zero-latency synchronization across all tools

## 🛠️ Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for authentication)

### **Installation**

```bash
cd co-lab
npm install
npm run dev
```

Access the platform at `http://localhost:3000` 🌐

### **Test Credentials**
- **Email**: `testuser@example.com`
- **Password**: `test123456`

## 💻 Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Realtime Database)
- **AI Integration**: Google Gemini API : GEMINI_API_KEY=AIzaSyDUMMY_KEY_1234567890abcdef

- **Real-time Communication**: WebRTC, Firebase Realtime Database
- **Deployment**: Vercel-ready

## ✨ Key Features

### 🎨 **Modern Landing Page**
- Clean, professional design optimized for presentations
- Interactive classroom preview with live whiteboard
- Feature showcases with visual demonstrations
- Dark mode support throughout

### 🤝 **Collaborative Learning**
- **Study Groups**: Subject-specific rooms for focused learning
- **Group Chat**: Real-time messaging with file sharing
- **Video Calls**: Built-in WebRTC video conferencing
- **Whiteboard**: Collaborative drawing and problem-solving
- **Live Quizzes**: Interactive assessments with instant feedback
- **Shared Notes**: Collaborative note-taking and organization

### 🤖 **AI-Powered Features**
- **Intelligent Moderation**: Real-time toxicity filtering and sentiment analysis
- **Smart Prompts**: Encourages quieter students to participate
- **Auto Summarization**: Key discussion points automatically captured
- **AI Chat Assistant**: Powered by Google Gemini for instant help
- **Adaptive Feedback**: AI adjusts difficulty based on student confidence

### 🔗 **Integrated External Tools**
Access powerful learning tools directly from the sidebar:
- **LearnStream** – Comprehensive study notes ([Vidya Notes](https://vidya-notes.vercel.app/))
- **Image Generation** – AI-powered visual aids ([LM Arena](https://lmarena.ai/?chat-modality=image))
- **Chat Assistant** – Advanced AI tutoring ([ChatDash](https://agency-vii2cx.chat-dash.com/prototype/69468b8fa7cc9c86728ef146))

### ♿ **Accessibility Features**
Education should have no barriers:
- **Dyslexia-Friendly Mode**: Specialized fonts and spacing
- **Screen Reader Support**: Fully semantic HTML with ARIA labels
- **Keyboard Navigation**: Complete platform control without a mouse
- **High Contrast Mode**: Enhanced visibility for low-vision users
- **Braille Output**: Experimental results in Braille text format
- **Text-to-Speech**: Voice output for all content
- **Customizable Settings**: Adjustable font size, spacing, and styles

## 🎯 User Journey

1. **Landing Page** → Discover interactive classroom features
2. **Sign Up/Login** → Create account or access existing one
3. **Dashboard** → View your groups and explore new ones
4. **Join Groups** → Connect with peers in your subjects
5. **Collaborate** → Video calls, whiteboard, chat, and learn together
6. **AI Assistance** → Get instant help and moderation
7. **External Tools** → Access specialized learning resources

## 🔐 Firebase Configuration

The platform uses Firebase for:
- **Authentication**: Secure user login and registration
- **Firestore**: Group data, messages, and user profiles
- **Realtime Database**: Live presence tracking and real-time updates
- **Storage**: File uploads and media sharing

See `FIREBASE_SETUP.md` for detailed configuration instructions.

## 🌍 Impact & Vision

**Our Goal**: Transform education through AI-powered collaborative learning

**Target Audience**:
- Students preparing for JEE, NEET, and competitive exams
- Learners seeking collaborative study environments
- Anyone who wants fearless, judgment-free learning spaces

**Impact Areas**:
- Breaking down barriers to quality education
- Providing free AI-powered learning assistance
- Creating safe, moderated learning environments
- Fostering peer-to-peer knowledge sharing

## 🚀 Deployment

The platform is optimized for deployment on:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Firebase Hosting**

```bash
npm run build
# Deploy the .next folder to your hosting platform
```

## 📖 Documentation

- `FIREBASE_SETUP.md` – Firebase configuration guide
- `FIREBASE_RULES_SETUP.md` – Security rules setup
- `TESTING_GUIDE.md` – Testing and QA procedures
- `HACKATHON_PRESENTATION_GUIDE.md` – Complete presentation guide for GDG Agentathon

## 🎬 Demo & Presentation

### **Live Demo**
- Platform URL: `http://localhost:3000`
- Interactive classroom preview with live whiteboard
- AI moderation showcase
- Real-time collaboration features

### **Key Talking Points**
1. **Voice-First Learning** – Natural conversation over typing
2. **AI Agent Squad** – Adaptive personas (Mentor, Skeptic, Peer)
3. **Group Simulations** – Safe practice before real presentations
4. **Intelligent Moderation** – Keeps discussions productive
5. **Infinite Whiteboard** – Visual learning with LaTeX and code support

## 🤝 Contributing

We welcome contributions! Whether it's:
- Bug fixes
- New features
- Documentation improvements
- Accessibility enhancements

Please feel free to submit pull requests or open issues.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **GDG Agentathon** for the opportunity and platform
- **Google Gemini** for AI capabilities
- **Firebase** for backend infrastructure
- Our amazing community of learners and contributors

---

**Made with ❤️ for fearless learners everywhere**

*LearnMate Vidya – Where Learning Meets Collaboration*

**GDG Agentathon 2025** 🚀

=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 1476c1cb48894801f0d4653515f6e31acbea0153
