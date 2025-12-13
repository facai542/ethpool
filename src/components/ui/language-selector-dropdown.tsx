import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt-BR", label: "Português (BR)", flag: "🇧🇷" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "zh", label: "繁體中文", flag: "🇹🇼" },
];

export const LanguageSelectorDropdown = () => {
  const { language, setLanguage } = useI18n();
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
    <div className="relative inline-block" ref={dropdownRef}>
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
            "bg-black/95 backdrop-blur-xl",
            "shadow-lg border border-gray-700",
            "animate-fade-in max-h-80 overflow-y-auto"
          )}
          style={{
            animation: 'fade-in 0.2s ease-out'
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                selected.code === lang.code
                  ? "font-semibold text-blue-400 bg-blue-900/30"
                  : "text-gray-200 hover:bg-gray-800"
              )}
            >
              <span>{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {selected.code === lang.code && (
                <Check className="h-4 w-4 text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 导出Component别名以兼容新样式
export const Component = LanguageSelectorDropdown;
