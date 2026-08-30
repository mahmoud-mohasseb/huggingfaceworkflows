'use client';

import React from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { HelpCircle } from 'lucide-react';

export const startInteractiveTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    popoverClass: 'driverjs-theme-dark',
    steps: [
      {
        element: '#hf-storage-badge',
        popover: {
          title: '🤗 Hugging Face Auto-Sync Storage',
          description: 'Your workflows automatically save to private dataset repo datasets/{username}/hf-workflow-data with commit history.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#node-sidebar-drawer',
        popover: {
          title: '📦 Node Library Sidebar',
          description: 'Drag and drop Triggers, Hugging Face AI Models, Logic Transformers, or Reply Endpoints directly onto the canvas.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#execute-full-workflow-btn',
        popover: {
          title: '⚡ Full DAG Execution',
          description: 'Press Cmd + Enter or click this button to run topological cycle check, variable interpolation, and step execution waterfall.',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  });

  driverObj.drive();
};

export const WorkflowTourButton: React.FC = () => {
  return (
    <button
      onClick={startInteractiveTour}
      title="Start Interactive Guided Tour (Driver.js)"
      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
    >
      <HelpCircle className="w-4 h-4" />
      <span className="hidden lg:inline">Guide</span>
    </button>
  );
};
