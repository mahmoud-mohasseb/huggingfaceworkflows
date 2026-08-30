import React from 'react';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'HF Flow - AI Workflow Canvas & Hugging Face Hub Engine',
  description: 'Visual AI Workflow Builder with Hugging Face Model Router, Gradio Spaces, and Real-time Debugger.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('hf_workspace_theme');
                  if (!saved) {
                    var store = localStorage.getItem('hf-workflow-settings');
                    if (store) {
                      var parsed = JSON.parse(store);
                      saved = parsed.state && parsed.state.canvas && parsed.state.canvas.theme;
                    }
                  }
                  var theme = saved || 'dark-glass';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add('theme-' + theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans selection:bg-violet-500 selection:text-white min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
