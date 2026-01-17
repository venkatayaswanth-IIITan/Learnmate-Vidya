"use client";

import SmoothScroll from 'smooth-scroll';
import ParticlesBg from 'particles-bg';

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 800,
  speedAsDuration: true,
  easing: 'easeInOutCubic',
});

const Navbar = () => {
  return (
    <nav className='bg-orange-20 bg-opacity-100 backdrop-filter backdrop-blur-lg shadow-md fixed w-full top-4 z-50 rounded-3xl mx-auto '>
      <div className='container mx-auto px-6 py-2 flex justify-between items-center '>
        <a href='#' className='text-2xl font-bold text-black '>
          Vidya AI
        </a>
        <div className='flex items-center space-x-4'>
          <a href="/login" className='bg-orange-500 text-white rounded-full px-4 py-2 text-sm hover:bg-orange-100 transition-colors duration-300 border border-orange-500 border-opacity-70 flex items-center'>
            Login
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
            </svg>
          </a>
          <a href="/signup" className='bg-orange-500 text-white rounded-full px-4 py-2 text-sm hover:bg-orange-100 transition-colors duration-300 border border-orange-500 border-opacity-70 flex items-center'>
            Sign Up
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
            </svg>
          </a>
          <a href="https://www.olabs.edu.in" target="_blank" rel="noopener noreferrer" className='bg-orange-500 text-white rounded-full px-4 py-2 text-sm hover:bg-orange-100 transition-colors duration-300 border border-orange-500 border-opacity-70 flex items-center'>
            Open Extension
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
};

const Lander = () => {
  return (
    <div>
      <Navbar />
      <header className='h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-center relative'>
        <ParticlesBg type="circle" bg={{ zIndex: 0, position: "absolute", top: 0 }} />
        <div className='relative z-10 max-w-2xl px-6'>
          <h1 className='text-5xl font-bold mb-6 text-black leading-tight'>
            Revolutionize collaboration learning with cutting edge AI features with Vidya AI
          </h1>
          <p className='text-lg text-black mb-8'>
            Experience the future with our cutting-edge platform designed to streamline your workflow and enhance productivity.
          </p>
          <a
            href='/login'
            className='inline-block bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300'
          >
            Let's Learn with Vidya AI!
          </a>
        </div>
      </header>
      <footer className="bg-gray-100 py-2 text-center">
        <p className="text-gray-600">&copy; {new Date().getFullYear()} Vidya AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Lander;