"use client";

import { useEffect } from 'react';

export default function TabsManager() {
  useEffect(() => {
    const handleTabClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('.custom-tab-btn')) {
        const targetId = target.getAttribute('data-target');
        const tabsContainer = target.closest('.custom-code-tabs');
        if (!tabsContainer || !targetId) return;
        
        tabsContainer.querySelectorAll('.custom-tab-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        
        tabsContainer.querySelectorAll('.custom-tab-pane').forEach(pane => {
          if (pane.id === targetId) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });
      }
    };

    document.addEventListener('click', handleTabClick);
    return () => {
      document.removeEventListener('click', handleTabClick);
    };
  }, []);

  return null;
}
