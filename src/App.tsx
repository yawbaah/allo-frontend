import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { I18nProvider, useTranslation } from './lib/i18n';
import LangSelect from './components/LangSelect';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RequireAuth from './components/RequireAuth';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Knowledge from './pages/dashboard/Knowledge';
import Inbox from './pages/dashboard/Inbox';
import Deploy from './pages/dashboard/Deploy';
import Settings from './pages/dashboard/Settings';
import Analytics from './pages/dashboard/Analytics';
import Billing from './pages/dashboard/Billing';

function Navbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav>
      <div className="container nav-container">
        <Link to="/" className="logo-text" onClick={closeMenu}>
          Allo
        </Link>

        {/* Desktop Links */}
        <div className="nav-links nav-desktop">
          <a href="/#product">{t('nav.product')}</a>
          <a href="/#solutions">{t('nav.solutions')}</a>
          <Link to="/pricing">{t('nav.pricing')}</Link>
          <a href="/#how">{t('nav.how')}</a>
        </div>

        {/* Desktop Action Buttons */}
        <div className="nav-desktop" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <LangSelect />
          <Link to="/login" className="btn btn-ghost">
            {t('nav.login')}
          </Link>
          <Link to="/onboarding" className="btn btn-primary">
            {t('nav.start')}
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          className="nav-mobile-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="public-mobile-dropdown">
          <div className="public-mobile-links">
            <a href="/#product" onClick={closeMenu}>
              {t('nav.product')}
            </a>
            <a href="/#solutions" onClick={closeMenu}>
              {t('nav.solutions')}
            </a>
            <Link to="/pricing" onClick={closeMenu}>
              {t('nav.pricing')}
            </Link>
            <a href="/#how" onClick={closeMenu}>
              {t('nav.how')}
            </a>
          </div>

          <div className="public-mobile-actions">
            <div style={{ marginBottom: '0.5rem' }}>
              <LangSelect compact={false} />
            </div>
            <Link
              to="/login"
              className="btn btn-ghost"
              style={{ width: '100%', border: '1px solid var(--border-color)', justifyContent: 'center' }}
              onClick={closeMenu}
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/onboarding"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={closeMenu}
            >
              {t('nav.start')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer>
      <div className="container">
        <div className="footer-links">
          <a href="https://www.linkedin.com/in/ernest-yaw-baah-5a6b87313/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://github.com/ernestyaw" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://x.com/ErnestBaah70844" target="_blank" rel="noreferrer">
            X (Twitter)
          </a>
          <a href="https://www.tiktok.com/@megax084" target="_blank" rel="noreferrer">
            TikTok
          </a>
          <a href="mailto:ernestbaah478@gmail.com">Email</a>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} Allo. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <>
      <Navbar />
      <Landing />
      <Footer />
    </>
  );
}

function PricingPage() {
  return (
    <>
      <Navbar />
      <Pricing />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Overview />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="deploy" element={<Deploy />} />
            <Route path="billing" element={<Billing />} /> {/* <-- Add Route Here */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </I18nProvider>
  );
}