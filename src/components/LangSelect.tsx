import { useTranslation } from '../lib/i18n';

export default function LangSelect({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useTranslation();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
      aria-label="Language"
      style={{
        background: compact ? 'rgba(255,255,255,0.04)' : 'transparent',
        color: 'var(--text-secondary)',
        border: compact ? '1px solid var(--border-color)' : 'none',
        borderRadius: 4,
        outline: 'none',
        cursor: 'pointer',
        fontSize: '0.8rem',
        padding: compact ? '0.35rem 0.5rem' : '0.25rem',
      }}
    >
      <option value="en">EN</option>
      <option value="fr">FR</option>
    </select>
  );
}