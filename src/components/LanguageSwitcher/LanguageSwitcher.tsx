import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' }
];

// prettier-ignore
const styles = {
  button: 'lang-button flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-accent transition-all duration-200 cursor-pointer border border-[var(--mvx-border-color-secondary)] hover:border-accent hover:scale-105',
  flag: 'text-lg',
  label: 'text-sm font-medium text-primary'
} satisfies Record<string, string>;

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  // Trouve la langue actuelle et la langue suivante
  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
  const nextLang = languages.find(lang => lang.code !== i18n.language) || languages[1];

  const toggleLanguage = () => {
    i18n.changeLanguage(nextLang.code);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={styles.button}
      title={`Switch to ${nextLang.label}`}
    >
      <span className={styles.flag}>{currentLang.flag}</span>
      <span className={styles.label}>{currentLang.label}</span>
    </button>
  );
};

