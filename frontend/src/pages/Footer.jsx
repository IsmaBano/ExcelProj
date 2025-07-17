import React from 'react';

function Footer() {
  return (
    <footer className="bg-[#217346] text-white py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <p className="text-center sm:text-left text-sm">
          &copy; {new Date().getFullYear()} Excel Analytics. All rights reserved.
        </p>
        <div className="mt-4 sm:mt-0 flex justify-center gap-4 text-sm">
          <a href="/" className="hover:underline">Privacy Policy</a>
          <a href="/" className="hover:underline">Terms of Service</a>
          <a href="/" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
