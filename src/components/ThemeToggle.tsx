import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/theme';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export default function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${compact ? 'compact' : ''} ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="theme-toggle-icon-wrap">
        {isDark ? (
          <Sun size={15} strokeWidth={1.75} className="theme-sun-icon" />
        ) : (
          <Moon size={15} strokeWidth={1.75} className="theme-moon-icon" />
        )}
      </div>
      {!compact && (
        <span className="theme-toggle-label">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
