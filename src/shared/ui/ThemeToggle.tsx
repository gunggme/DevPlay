import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentIcon = theme === 'dark' ? (
    <Moon className="size-5" />
  ) : theme === 'light' ? (
    <Sun className="size-5" />
  ) : (
    <Monitor className="size-5" />
  );

  const themes = [
    { value: 'light', label: '라이트', icon: <Sun className="size-4" /> },
    { value: 'dark', label: '다크', icon: <Moon className="size-4" /> },
    { value: 'system', label: '시스템', icon: <Monitor className="size-4" /> },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 transition-colors hover:bg-accent"
        aria-label="테마 변경"
      >
        {currentIcon}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border bg-popover p-1 shadow-lg">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTheme(t.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
                theme === t.value ? 'bg-accent' : ''
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {theme === t.value && (
                <svg
                  className="ml-auto size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}