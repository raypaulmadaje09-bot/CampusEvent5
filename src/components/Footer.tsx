import React from 'react';
import { Calendar, Globe, Mail, Phone, MessageSquare } from 'lucide-react';

import { cn } from '../utils/cn';

interface FooterProps {
  homeConfig?: any;
  theme?: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ homeConfig, theme }) => {
  const isDark = theme === 'dark';

  return (
    <footer className={cn(
      "border-t pt-16 pb-8 transition-colors duration-300",
      isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/20">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className={cn(
                "text-xl font-bold tracking-tight",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {homeConfig?.campusName || 'CampusPulse'}
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {homeConfig?.footerText || 'The central hub for everything happening on campus. Discover, plan, and connect with your community.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><MessageSquare className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Phone className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className={cn(
              "font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}>Explore</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">All Events</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Student Clubs</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Campus Map</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Resources</a></li>
            </ul>
          </div>

          <div>
            <h3 className={cn(
              "font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}>Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Safety Guide</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Report Issue</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Feedback</a></li>
            </ul>
          </div>
        </div>
        
        <div className={cn(
          "border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4",
          isDark ? "border-gray-800" : "border-gray-100"
        )}>
          <p className="text-gray-500 text-sm">© 2024 CampusPulse. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
