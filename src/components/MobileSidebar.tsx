import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import LangSelect from './LangSelect';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface SidebarBilling {
  plan: string;
  message_usage: number;
  message_limit: number;
  usage_percentage: number;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  billing: SidebarBilling | null;
  onLogout: () => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  navItems,
  billing,
  onLogout,
}: MobileSidebarProps) {
  const { t } = useTranslation();

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-nav-below-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="mobile-nav-below-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Navigation Links */}
        <nav className="mobile-nav-below-links">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `mobile-nav-below-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Language Picker */}
        <div className="mobile-nav-below-section">
          <div className="mobile-nav-below-title">{t('dash.language')}</div>
          <LangSelect compact={false} />
        </div>

        {/* Plan Usage Meter */}
        <div className="mobile-nav-below-section">
          {billing ? (
            <div className="mobile-nav-below-plan">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#fff' }}>
                  {billing.plan} Plan
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {billing.message_usage.toLocaleString()} / {billing.message_limit.toLocaleString()}
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(billing.usage_percentage, 100)}%`,
                    background:
                      billing.message_usage >= billing.message_limit ? '#ef4444' : '#ffffff',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Loading credits…
            </span>
          )}
        </div>

        {/* Logout Button */}
        <div className="mobile-nav-below-footer">
          <button
            type="button"
            className="mobile-nav-below-logout"
            onClick={() => {
              onClose();
              onLogout();
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>{t('dash.logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
