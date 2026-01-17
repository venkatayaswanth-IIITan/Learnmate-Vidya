'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-white dark:bg-[#101022] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <span className="text-xl">🎓</span>
          </div>
          <span className="font-bold text-lg tracking-tight">LearnMate Vidya</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a className="hover:text-blue-600 transition-colors" href="#">Courses</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Mentors</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Community</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 px-3 py-2">
            Log in
          </Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg">
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex flex-col gap-6 lg:w-1/2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wider">Live Classes Active</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              Learn Together, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Grow Faster.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Jump into a fearless learning environment. Connect with peers in live video classrooms and let our <span className="font-semibold text-blue-600 dark:text-blue-400">AI Agents</span> facilitate your study sessions with real-time feedback.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-2">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-blue-500"></div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-green-500"></div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-purple-500"></div>
                <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">+2k</div>
              </div>
              <p>Students learning right now</p>
            </div>
          </div>

          {/* Right - Interactive Classroom Preview */}
          <div className="lg:w-1/2 relative w-full">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[80px]"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-transform duration-500 hover:-translate-y-1">
              {/* Window Controls */}
              <div className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm border border-gray-200 dark:border-gray-700">
                  <span className="text-blue-600">🔒</span>
                  Linear Algebra 101 - Group 4A
                </div>
                <div className="flex gap-3 text-slate-400">
                  <span>−</span>
                  <span>□</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex h-[400px]">
                {/* Toolbar */}
                <div className="w-16 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-6 bg-gray-50 dark:bg-gray-950">
                  <button className="p-2 rounded-lg bg-blue-600/10 text-blue-600">✏️</button>
                  <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">👆</button>
                  <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">🔤</button>
                  <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">🖼️</button>
                  <div className="mt-auto">
                    <button className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">🚪</button>
                  </div>
                </div>

                {/* Whiteboard */}
                <div className="flex-1 relative bg-white dark:bg-gray-900 p-6 overflow-hidden" style={{ backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  <div className="absolute top-10 left-10">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Shared Whiteboard</h3>
                    <div className="text-2xl text-slate-800 dark:text-slate-200" style={{ fontFamily: 'Comic Sans MS, sans-serif' }}>
                      f(x) = x² + 2x + 1
                    </div>
                    <div className="mt-2 w-48 h-32 border-l-2 border-b-2 border-slate-300 dark:border-slate-600 relative">
                      <svg className="absolute bottom-0 left-0 w-full h-full text-blue-600" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,0 Q50,100 100,0" fill="none" stroke="currentColor" strokeWidth="2"></path>
                      </svg>
                    </div>
                  </div>

                  {/* AI Assistant Message */}
                  <div className="absolute top-6 right-6 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-10">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Vidya AI • <span className="text-green-500">Online</span></p>
                        <div className="text-xs text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 p-2 rounded-lg rounded-tl-none">
                          Great graph! Remember that the vertex is at x = -1.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cursor Animation */}
                  <div className="absolute bottom-20 right-20 flex flex-col items-center animate-bounce">
                    <div className="px-2 py-1 bg-green-500 text-white text-[10px] rounded mb-1 shadow-sm">Sarah is typing...</div>
                    <span className="text-green-500 text-xl">➤</span>
                  </div>
                </div>

                {/* Video Participants */}
                <div className="w-24 lg:w-32 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col gap-2 p-2 overflow-y-auto">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1 rounded">You</div>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                    <div className="absolute top-1 right-1 bg-blue-600 p-0.5 rounded-full">
                      <span className="text-white text-[10px]">🔇</span>
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
                  </div>
                  <button className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                    <span className="text-2xl">+</span>
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 flex justify-center gap-4">
                <button className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 flex items-center justify-center transition-colors">🎤</button>
                <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">📹</button>
                <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110">📺</button>
                <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">💬</button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-7xl px-6 pb-24 mt-12">
          <div className="flex flex-col gap-24">
            {/* Feature 1: AI Moderation */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white">
                      🤖
                    </div>
                    <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-300">
                      Active Monitoring
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shrink-0">
                        👤
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-0.5">User123</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">I think the answer is definitely 42!</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30 flex gap-3 ml-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                        🤖
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 mb-0.5">Vidya AI</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">That's a popular answer! Can you explain the steps you took to arrive there?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent AI Moderation</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Learning in groups can be chaotic. Our AI moderator ensures everyone stays on track, preventing dominance by single speakers.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-600 dark:text-slate-400">Real-time toxicity filtering and sentiment analysis.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-600 dark:text-slate-400">Automatic summarization of key discussion points.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-600 dark:text-slate-400">Prompts to include quieter students in the discussion.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Whiteboard */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                  <span className="text-3xl">✏️</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Infinite Interactive Whiteboard</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Visualize your thoughts instantly. Our infinite canvas supports mathematical notation, code syntax highlighting, and freehand drawing.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">LaTeX Support</span>
                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">Code Blocks</span>
                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">Image Upload</span>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl aspect-video flex items-center justify-center">
                  <div className="font-mono text-sm bg-slate-900 text-green-400 p-4 rounded-lg shadow-2xl">
                    <span className="text-pink-400">def</span> <span className="text-blue-400">solve_quadratic</span>(a, b, c):<br />
                    &nbsp;&nbsp;d = (b**2) - (4*a*c)<br />
                    &nbsp;&nbsp;<span className="text-pink-400">return</span> (-b - cmath.sqrt(d))/(2*a)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full px-6 pb-20 max-w-7xl">
          <div className="w-full bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-3">Ready to transform your study sessions?</h2>
              <p className="text-blue-100 text-lg">Join thousands of students learning smarter with AI assistance.</p>
            </div>
            <div className="relative z-10">
              <Link href="/signup" className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}