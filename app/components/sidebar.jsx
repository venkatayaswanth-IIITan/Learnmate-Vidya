import React from 'react';
import Link from 'next/link';

const DashboardLayout = ({ children, activeItem = 'dashboard', onVoiceAssistantClick }) => {
  const sidebarItems = [
    {
      id: 'dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      href: '/dashboard',
      label: 'Dashboard'
    },
    {
      id: 'courses',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: '/groups',
      label: 'Groups'
    },
    {
      id: 'learnstream',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      href: 'https://vidya-f-aylq.vercel.app/',
      label: 'LearnStream',
      external: true
    },
    {
      id: 'roadmap',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      href: '/roadmap',
      label: 'Roadmap'
    },
  ];

  return (
    <div className="min-h-screen bg-[#333333] flex p-2">
      <div className="fixed h-screen w-16 flex flex-col">
        <div className="flex items-center justify-center h-16">
          <Link href="/dashboard" className="text-[#ff5722] font-bold text-xl">C</Link>
        </div>

        <div className="flex flex-col items-center py-4 space-y-4 flex-1">
          {sidebarItems.map((item) => (
            item.external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-lg w-12 h-12 flex items-center justify-center transition-colors duration-200 ${activeItem === item.id
                  ? 'bg-[#ff5722]/10 text-[#ff5722]'
                  : 'text-white hover:bg-white/10 hover:text-[#ff5722]'
                  }`}
                title={item.label}
              >
                {item.icon}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={`p-3 rounded-lg w-12 h-12 flex items-center justify-center transition-colors duration-200 ${activeItem === item.id
                  ? 'bg-[#ff5722]/10 text-[#ff5722]'
                  : 'text-white hover:bg-white/10 hover:text-[#ff5722]'
                  }`}
                title={item.label}
              >
                {item.icon}
              </Link>
            )
          ))}

          {/* Chat Assistant Button */}
          <a
            href="https://agency-7ilqvp.chat-dash.com/prototype/696b852b6f8ec8d97dca2397"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg w-12 h-12 flex items-center justify-center transition-all duration-200 text-white hover:bg-[#ff5722]/20 hover:text-[#ff5722] hover:scale-110"
            title="Chat Assistant"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </a>
        </div>

        <div className="p-4 flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-[#ff5722] text-white flex items-center justify-center font-semibold cursor-pointer">
            KV
          </div>
        </div>
      </div>

      <div className="ml-16 flex-1 p-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;