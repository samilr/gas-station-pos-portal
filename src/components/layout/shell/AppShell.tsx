import React, { useState, useCallback, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Rail from './Rail';
import NavPanel from './NavPanel';
import TopBar from './TopBar';
import StatusBar from './StatusBar';

interface AppShellProps {
  activeSection: string;
}

const MIN_NAV_WIDTH = 160;
const MAX_NAV_WIDTH = 320;
const DEFAULT_NAV_WIDTH = 200;

const AppShell: React.FC<AppShellProps> = ({ activeSection }) => {
  const [navWidth, setNavWidth] = useState(DEFAULT_NAV_WIDTH);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startWidth = navWidth;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX;
      const newWidth = Math.min(MAX_NAV_WIDTH, Math.max(MIN_NAV_WIDTH, startWidth + delta));
      setNavWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [navWidth]);

  return (
    <div className="h-screen flex bg-rail-bg">
      {/* Rail - full-height, collapsible (44px icons / 200px with labels) */}
      <div className="relative flex-shrink-0 h-full z-40">
        <Rail activeSection={activeSection} expanded={railExpanded} />
        {/* Rail toggle button */}
        <button
          onClick={() => setRailExpanded(!railExpanded)}
          className="absolute -right-2 top-3 z-50 bg-white hover:bg-gray-100 border border-gray-300 text-gray-500 hover:text-gray-800 w-4 h-4 rounded-full shadow-sm flex items-center justify-center transition-all"
          title={railExpanded ? 'Colapsar' : 'Expandir'}
        >
          {railExpanded ? <ChevronLeft className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
        </button>
      </div>

      {/* Right column: TopBar + (NavPanel + Content) + StatusBar */}
      <div className="flex flex-1 flex-col min-w-0 bg-white rounded-l-xl overflow-hidden shadow-lg z-10 relative">
        {/* Top bar - beside rail, not above it */}
        <TopBar activeSection={activeSection} />

        {/* Main area: NavPanel + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* NavPanel - collapsible + resizable */}
          {!navCollapsed && (
            <div style={{ width: navWidth, minWidth: MIN_NAV_WIDTH, maxWidth: MAX_NAV_WIDTH }} className="flex-shrink-0 h-full">
              <NavPanel activeSection={activeSection} />
            </div>
          )}

          {/* Resize handle + NavPanel toggle */}
          <div className="relative flex-shrink-0 h-full z-30">
            {!navCollapsed && (
              <div
                onMouseDown={handleMouseDown}
                className="w-[5px] h-full bg-nav-border hover:bg-blue-400 active:bg-blue-500 transition-colors cursor-col-resize"
              />
            )}
            <button
              onClick={() => setNavCollapsed(!navCollapsed)}
              className="absolute -right-2 top-3 z-40 bg-white hover:bg-gray-100 border border-gray-300 text-gray-500 hover:text-gray-800 w-4 h-4 rounded-full shadow-sm flex items-center justify-center transition-all"
              title={navCollapsed ? 'Expandir panel' : 'Colapsar panel'}
            >
              {navCollapsed ? <ChevronRight className="w-2 h-2" /> : <ChevronLeft className="w-2 h-2" />}
            </button>
          </div>

          {/* Content */}
          <main className="flex-1 h-full overflow-y-auto p-3 bg-white min-w-0">
            <Outlet />
          </main>
        </div>

        {/* Status bar */}
        <StatusBar />
      </div>
    </div>
  );
};

export default AppShell;
