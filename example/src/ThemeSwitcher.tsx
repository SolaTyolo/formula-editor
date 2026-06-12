import { useEffect, useRef, useState } from 'react';
import type { AppMessages } from './i18n';
import { THEME_PRESETS, type ThemePresetId } from './editorTheme';

export const PRESET_LABEL_KEYS: Record<
  ThemePresetId,
  { title: keyof AppMessages; desc: keyof AppMessages }
> = {
  minimal: { title: 'themeMinimal', desc: 'themeMinimalDesc' },
  default: { title: 'themeDefault', desc: 'themeDefaultDesc' },
  indigo: { title: 'themeIndigo', desc: 'themeIndigoDesc' },
  rose: { title: 'themeRose', desc: 'themeRoseDesc' },
  ocean: { title: 'themeOcean', desc: 'themeOceanDesc' },
  dark: { title: 'themeDark', desc: 'themeDarkDesc' },
};

export function editorWrapClass(presetId: ThemePresetId): string {
  if (presetId === 'minimal') return 'editor-panel__wrap editor-panel__wrap--minimal';
  if (presetId === 'dark') return 'editor-panel__wrap editor-panel__wrap--dark';
  return 'editor-panel__wrap';
}

type ThemeSwitcherProps = {
  value: ThemePresetId;
  onChange: (id: ThemePresetId) => void;
  messages: AppMessages;
};

export function ThemeSwitcher({ value, onChange, messages }: ThemeSwitcherProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const labels = PRESET_LABEL_KEYS[value];

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (switcherRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const selectPreset = (id: ThemePresetId) => {
    onChange(id);
    setMenuOpen(false);
  };

  return (
    <div className="theme-switcher" ref={switcherRef}>
      <button
        type="button"
        className="theme-switcher__btn"
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="theme-switcher__label">{messages.themeSwitchLabel}</span>
        <span className="theme-switcher__value">{messages[labels.title]}</span>
        <svg
          className={`theme-switcher__icon${menuOpen ? ' is-open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {menuOpen ? (
        <ul className="theme-switcher__menu" role="listbox" aria-label={messages.themeSwitchLabel}>
          {THEME_PRESETS.map((preset) => {
            const itemLabels = PRESET_LABEL_KEYS[preset.id];
            const selected = preset.id === value;
            return (
              <li key={preset.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`theme-switcher__menuItem${selected ? ' is-active' : ''}`}
                  onClick={() => selectPreset(preset.id)}
                >
                  <span className="theme-switcher__menuTitle">{messages[itemLabels.title]}</span>
                  <span className="theme-switcher__menuDesc">{messages[itemLabels.desc]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
