import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { languageNames } from "@/lib/i18n";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "繁體中文", flag: "🇹🇼" },
];

export const LanguageSelectorDropdown = () => {
  const { language, setLanguage, availableLanguages } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 找到当前选中的语言
  const selected = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any);
    setOpen(false);
  };

  return (
    <div className="language-selector-dropdown relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
          "bg-white/60 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm",
          "border-gray-200 dark:border-neutral-700",
          "text-gray-800 dark:text-neutral-200",
          "hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
        )}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6) !important',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(229, 231, 235, 1)',
          color: 'rgba(31, 41, 55, 1)'
        }}
      >
        <span>{selected.flag}</span>
        <span>{selected.label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={cn(
            "absolute left-0 mt-2 w-48 rounded-xl overflow-hidden z-[12000]",
            "bg-white/90 dark:bg-neutral-900/95 backdrop-blur-xl",
            "shadow-lg border border-gray-200 dark:border-neutral-700",
            "animate-fade-in"
          )}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                selected.code === lang.code
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : "text-gray-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
              )}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: selected.code === lang.code ? '#2563eb' : 'rgba(31, 41, 55, 1)'
              }}
            >
              <span>{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {selected.code === lang.code && (
                <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
      
      <style jsx>{`
        :global(.language-selector-dropdown button) {
          background-color: rgba(255, 255, 255, 0.6) !important;
          background: rgba(255, 255, 255, 0.6) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(229, 231, 235, 1) !important;
          color: rgba(31, 41, 55, 1) !important;
        }
        
        :global(.language-selector-dropdown button:hover) {
          background-color: rgba(249, 250, 251, 1) !important;
          background: rgba(249, 250, 251, 1) !important;
        }
        
        :global(.language-selector-dropdown button *) {
          color: inherit !important;
          background-color: transparent !important;
          background: transparent !important;
        }
        
        :global(.language-selector-dropdown [role="button"]) {
          background-color: transparent !important;
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};
