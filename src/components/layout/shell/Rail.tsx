import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '../../../hooks/useNavigation';
import { usePermissions } from '../../../hooks/usePermissions';
import { menuItems, type MenuItem, type SubMenuItem } from './menuConfig';
import * as Tooltip from '@radix-ui/react-tooltip';

interface RailProps {
  activeSection: string;
  expanded?: boolean;
}

const Rail: React.FC<RailProps> = ({ activeSection, expanded = false }) => {
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const { routeMap } = useNavigation();
  const { can } = usePermissions();

  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'AUDIT' && (item.id === 'users' || item.id === 'logs' || item.id === 'sites')) {
      return false;
    }
    if (item.categoryPermission && !can(item.categoryPermission as any)) {
      return false;
    }
    return !item.permission || hasPermission(item.permission);
  });

  const getFilteredSubItems = (subItems?: SubMenuItem[]) => {
    return subItems?.filter(subItem =>
      !subItem.permission || hasPermission(subItem.permission)
    ) || [];
  };

  const handleClick = (item: MenuItem) => {
    if (item.subItems) {
      const filtered = getFilteredSubItems(item.subItems);
      if (filtered.length > 0) {
        const route = routeMap[filtered[0].id];
        if (route) navigate(route);
        return;
      }
    }
    const route = routeMap[item.id];
    if (route) navigate(route);
  };

  const isActive = (item: MenuItem) => {
    // Exact sub-item match wins (handles cross-module placements like NCF under Fiscal)
    if (item.subItems?.some(sub => sub.id === activeSection)) return true;
    // Prefix match, but only if no other module claims this section as an exact sub-item
    if (activeSection === item.id || activeSection.startsWith(item.id + '.')) {
      const claimedElsewhere = menuItems.some(
        m => m.id !== item.id && m.subItems?.some(sub => sub.id === activeSection)
      );
      return !claimedElsewhere;
    }
    return false;
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className={`${expanded ? 'w-[200px]' : 'w-[44px]'} bg-rail-bg flex flex-col py-2 flex-shrink-0 h-full transition-all duration-200 overflow-hidden`}>
        {/* Logo */}
        <div className={`flex items-center mb-3 flex-shrink-0 ${expanded ? 'px-3 gap-2' : 'justify-center'}`}>
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xs">MC</span>
          </div>
          {expanded && (
            <span className="text-white font-bold text-sm whitespace-nowrap">MAGIC CLOUD</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide w-full">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            const button = (
              <button
                onClick={() => handleClick(item)}
                className={`relative w-full flex items-center h-9 transition-colors ${
                  expanded ? 'px-3 gap-2' : 'justify-center'
                } ${
                  active
                    ? 'text-rail-icon-active'
                    : 'text-rail-icon hover:text-gray-300'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-rail-accent rounded-r" />
                )}
                <Icon className="w-[16px] h-[16px] flex-shrink-0" />
                {expanded && (
                  <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                )}
              </button>
            );

            // Show tooltips only when collapsed
            if (expanded) {
              return <React.Fragment key={item.id}>{button}</React.Fragment>;
            }

            return (
              <Tooltip.Root key={item.id}>
                <Tooltip.Trigger asChild>
                  {button}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={8}
                    className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                  >
                    {item.label}
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </nav>

        {/* User avatar */}
        <div className={`mt-2 flex-shrink-0 ${expanded ? 'px-3' : 'flex justify-center'}`}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => navigate('/dashboard/users/profile')}
                className={`flex items-center ${expanded ? 'gap-2' : ''}`}
              >
                <div className="w-[22px] h-[22px] bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xs font-medium">{userInitial}</span>
                </div>
                {expanded && (
                  <span className="text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{user?.name}</span>
                )}
              </button>
            </Tooltip.Trigger>
            {!expanded && (
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                >
                  {user?.name || 'Perfil'}
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </Tooltip.Root>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default Rail;
