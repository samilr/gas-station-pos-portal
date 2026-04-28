import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '../../../hooks/useNavigation';
import { menuItems, type SubMenuItem } from './menuConfig';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';

interface NavPanelProps {
  activeSection: string;
}

const NavPanel: React.FC<NavPanelProps> = ({ activeSection }) => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { routeMap } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Find which module contains the active section as a sub-item
  const findParentModule = () => {
    const topLevel = activeSection.split('.')[0];
    // Prefer exact sub-item match (handles cases where a section lives in a module
    // whose id differs from the section's top-level prefix, e.g. transactions.revenue → fiscal)
    const subItemMatch = menuItems.find(item =>
      item.subItems?.some(sub => sub.id === activeSection)
    );
    if (subItemMatch) return subItemMatch;
    // Fall back to top-level id match
    const directMatch = menuItems.find(item => item.id === topLevel);
    if (directMatch) return directMatch;
    // Finally, fuzzy match by top-level prefix inside sub-items
    return menuItems.find(item =>
      item.subItems?.some(sub => sub.id.split('.')[0] === topLevel)
    ) || null;
  };

  const activeModule = findParentModule();

  const getFilteredSubItems = (subItems?: SubMenuItem[]) => {
    return subItems?.filter(subItem =>
      !subItem.permission || hasPermission(subItem.permission)
    ) || [];
  };

  const filteredItems = useMemo(() => {
    if (!activeModule?.subItems) return [];
    const items = getFilteredSubItems(activeModule.subItems);
    if (!searchQuery) return items;
    return items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeModule, searchQuery]);

  const handleNavigate = (sectionId: string) => {
    const route = routeMap[sectionId];
    if (route) navigate(route);
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const moduleLabel = activeModule?.label || 'Navegación';

  return (
    <div className="h-full bg-nav-bg border-r border-nav-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <h2 className="text-2xs font-bold uppercase tracking-wide text-text-secondary mb-2">
          {moduleLabel}
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-7 pr-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Tree items */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-1 py-1">
        {!activeModule?.subItems ? (
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`w-full flex items-center gap-2 px-3 h-7 text-sm transition-colors ${
              activeSection === 'dashboard'
                ? 'bg-nav-active-bg text-nav-active-text font-medium'
                : 'text-nav-text hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
        ) : (
          filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-2 px-3 h-7 text-sm transition-colors ${
                  isActive
                    ? 'bg-nav-active-bg text-nav-active-text font-medium'
                    : 'text-nav-text hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })
        )}
      </nav>
    </div>
  );
};

export default NavPanel;
