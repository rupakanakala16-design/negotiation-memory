import React from 'react';

export type NavItemKey = '01' | '02' | '03' | '04' | '05';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  retainedCount?: number;
  milvusSyncRate?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  retainedCount = 0,
  milvusSyncRate = '99.8%',
}) => {
  const navItems: { id: NavItemKey; label: string; icon: string }[] = [
    { id: '01', label: '01 Command Center', icon: 'dashboard' },
    { id: '02', label: '02 Active Negotiation', icon: 'handshake' },
    { id: '03', label: '03 Past Experiences', icon: 'history_edu' },
    { id: '04', label: '04 Hindsight Memory', icon: 'lightbulb' },
    { id: '05', label: '05 Intelligence Timeline', icon: 'timeline' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between pt-4 pb-4 select-none border-r border-surface-container/60">
      <div className="flex flex-col">
        {/* Brand Lockup */}
        <div
          className="px-space-lg mb-space-lg flex items-center gap-space-sm cursor-pointer"
          onClick={() => onSelectTab('01')}
        >
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider block">
              Platform Console
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
              Intel Memory
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-space-lg mb-space-sm">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
            Intelligence Views
          </span>
        </div>

        <nav className="px-space-sm flex flex-col gap-space-xs" role="tablist">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-space-md py-space-sm rounded-lg transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="font-body-sm text-body-sm">{item.label}</span>
                </div>
                {item.id === '05' && retainedCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold">
                    +{retainedCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Engine Status Bottom Telemetry Widget */}
      <div className="px-space-md pt-space-md pb-space-md mx-space-sm bg-surface-container-low rounded-xl border border-surface-container">
        <div className="flex items-center gap-space-xs mb-space-xs">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span className="font-code-id text-code-id text-on-surface font-semibold">Engine Status</span>
        </div>
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-code-id text-code-id text-on-surface-variant">FastAPI</span>
            <span className="font-code-id text-code-id text-tertiary font-medium">v4.2 Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-code-id text-code-id text-on-surface-variant">Milvus Vector</span>
            <span className="font-code-id text-code-id text-primary font-medium">{milvusSyncRate} Sync</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-code-id text-code-id text-on-surface-variant">Precision</span>
            <span className="font-code-id text-code-id text-on-surface font-medium">Zero Drift</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
