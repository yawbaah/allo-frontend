import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Code2,
  Settings as SettingsIcon,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import { clearSession, getSession } from '../../lib/auth';
import { useTranslation } from '../../lib/i18n';
import { apiRequest } from '../../lib/api';
import LangSelect from '../../components/LangSelect';
import ThemeToggle from '../../components/ThemeToggle';
import MobileSidebar from '../../components/MobileSidebar';
import { useIsTablet } from '../../hooks/useMediaQuery';

interface SidebarBilling {
  plan: string;
  message_usage: number;
  message_limit: number;
  usage_percentage: number;
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isTablet = useIsTablet();

  const [billing, setBilling] = useState<SidebarBilling | null>(null);

  const navItems = [
    { to: '/dashboard', label: t('dash.overview'), icon: LayoutDashboard, end: true },
    { to: '/dashboard/knowledge', label: t('dash.knowledge'), icon: BookOpen },
    { to: '/dashboard/inbox', label: t('dash.inbox'), icon: MessageSquare },
    { to: '/dashboard/analytics', label: t('dash.analytics'), icon: BarChart3 },
    { to: '/dashboard/deploy', label: t('dash.deploy'), icon: Code2 },
    { to: '/dashboard/billing', label: t('dash.billing'), icon: CreditCard },
    { to: '/dashboard/settings', label: t('dash.settings'), icon: SettingsIcon },
  ];

  const titles: Record<string, string> = {
    '/dashboard': t('dash.overview'),
    '/dashboard/knowledge': t('dash.knowledge'),
    '/dashboard/inbox': t('dash.inbox'),
    '/dashboard/analytics': t('dash.analytics'),
    '/dashboard/deploy': t('dash.deploy'),
    '/dashboard/billing': t('dash.billing'),
    '/dashboard/settings': t('dash.settings'),
  };

  const title = titles[pathname] ?? t('dash.overview');
  const [sidebarOpen, setSidebarOpen] = useState(!isTablet);

  // Auto-close dropdown when navigating on mobile/tablet
  useEffect(() => {
    if (isTablet) {
      setSidebarOpen(false);
    }
  }, [pathname, isTablet]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const session = getSession();
  const companyName = session?.company ?? 'Company';
  const userEmail = session?.email ?? 'user@company.com';

  // Explicit type check to prevent map compile errors
  const initials = companyName && typeof companyName === 'string'
    ? companyName
        .split(/\s+/)
        .map((w: string) => (w && w[0] ? w[0] : ''))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CO';

  const logout = () => {
    clearSession();
    navigate('/login');
  };

  const fetchSidebarMetrics = async () => {
    try {
      const data = await apiRequest<SidebarBilling>('/billing/dashboard/');
      setBilling(data);
    } catch (err) {
      console.error('Failed to load usage for sidebar metrics', err);
    }
  };

  useEffect(() => {
    fetchSidebarMetrics();
    const interval = setInterval(fetchSidebarMetrics, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`dash-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Desktop Persistent Sidebar */}
      {!isTablet && (
        <aside className={`dash-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="dash-sidebar-top">
            <NavLink to="/dashboard" className="logo-text">
              Allo
            </NavLink>
          </div>

          <nav className="dash-nav">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div style={{ padding: '0 1rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {t('dash.language')}
              </span>
              <LangSelect compact />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Theme
              </span>
              <ThemeToggle compact />
            </div>
          </div>

          {/* Dynamic Usage Meter block */}
          <div className="dash-plan" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {billing ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--text-primary)' }}>{billing.plan}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{billing.message_usage.toLocaleString()} / {billing.message_limit.toLocaleString()}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--meter-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: billing.message_usage >= billing.message_limit ? '#ef4444' : 'var(--meter-fill)',
                      width: `${Math.min(billing.usage_percentage, 100)}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ) : (
              <span>Loading credits…</span>
            )}
          </div>

          <button type="button" className="logout-btn" onClick={logout}>
            <LogOut size={16} strokeWidth={1.5} />
            <span>{t('dash.logout')}</span>
          </button>
        </aside>
      )}

      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {isTablet && sidebarOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
            <h1>{title}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle compact />
            <div className="user-menu-wrapper" ref={menuRef}>
              <button type="button" className="avatar-btn" onClick={() => setUserMenuOpen((v) => !v)}>
                <span className="user-company-label">{companyName}</span>
                <div className="avatar">{initials}</div>
                <ChevronDown
                  size={14}
                  style={{
                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: 'var(--text-secondary)',
                  }}
                />
              </button>

            {userMenuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{companyName}</div>
                  <div className="user-dropdown-email">{userEmail}</div>
                </div>
                <div className="user-dropdown-divider" />
                <NavLink to="/dashboard/settings" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                  <SettingsIcon size={16} strokeWidth={1.5} />
                  <span>{t('dash.settingsLink')}</span>
                </NavLink>
                <button
                  type="button"
                  className="user-dropdown-item danger"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  <span>{t('dash.logout')}</span>
                </button>
              </div>
            )}
            </div>
          </div>
        </header>

        {/* Mobile Dropdown Navigation opening directly below Topbar */}
        {isTablet && (
          <MobileSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            navItems={navItems}
            billing={billing}
            onLogout={logout}
          />
        )}

        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}