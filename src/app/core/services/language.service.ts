import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, lastValueFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export type Language = 'en' | 'ar';

interface Translations {
    [key: string]: string | Translations;
}

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly STORAGE_KEY = 'app-language';
    private translations: Record<Language, Translations> = {
        en: {},
        ar: {}
    };

    // Signal for reactive language state
    currentLanguage = signal<Language>(this.getStoredLanguage());

    constructor(private http: HttpClient) {
        this.applyLanguage(this.currentLanguage());
    }

    /**
     * Load translation files and return a promise that resolves when both are loaded
     */
    loadTranslations(): Promise<void> {
        console.log('[LanguageService] Starting to load translations...');
        return lastValueFrom(
            forkJoin([
                this.loadTranslationFile('en'),
                this.loadTranslationFile('ar')
            ])
        ).then(() => {
            console.log('[LanguageService] All translations loaded', this.translations);
        }).catch(err => {
            console.error('[LanguageService] Failed to load translations:', err);
            throw err;
        });
    }

    /**
     * Load a specific translation file
     */
    private loadTranslationFile(lang: Language): Observable<Translations> {
        const url = `/assets/i18n/${lang}.json`;
        console.log(`[LanguageService] Loading ${lang} from ${url}`);

        return this.http.get<Translations>(url).pipe(
            tap(translations => {
                console.log(`[LanguageService] Loaded ${lang} translations:`, Object.keys(translations));
                this.translations[lang] = translations;
            }),
            catchError(error => {
                console.error(`[LanguageService] FAILED to load ${lang} translations:`, error);
                return of({});
            })
        );
    }

    /**
     * Get translation for a key
     * @param key - Translation key in dot notation (e.g., 'navbar.home')
     * @param params - Optional parameters for string interpolation
     */
    translate(key: string, params?: Record<string, string | number>): string {
        const lang = this.currentLanguage();
        const translation = this.getNestedTranslation(this.translations[lang], key);

        if (!translation) {
            console.warn(`Translation not found for key: ${key} in language: ${lang}`);
            return key;
        }

        // Replace params if provided
        if (params) {
            return this.interpolate(translation, params);
        }

        return translation;
    }

    /**
     * Get nested translation value
     */
    private getNestedTranslation(obj: Translations, path: string): string {
        const keys = path.split('.');
        let current: any = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return '';
            }
        }

        return typeof current === 'string' ? current : '';
    }

    /**
     * Interpolate parameters into translation string
     * Example: "Hello {{name}}" with {name: "John"} => "Hello John"
     */
    private interpolate(text: string, params: Record<string, string | number>): string {
        return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
            return params[key]?.toString() || '';
        });
    }

    /**
     * Get the stored language from localStorage or default to English
     */
    private getStoredLanguage(): Language {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return (stored === 'ar' || stored === 'en') ? stored : 'en';
    }

    /**
     * Toggle between Arabic and English
     */
    toggleLanguage(): void {
        const newLang: Language = this.currentLanguage() === 'en' ? 'ar' : 'en';
        this.setLanguage(newLang);
    }

    /**
     * Set a specific language
     */
    setLanguage(lang: Language): void {
        this.currentLanguage.set(lang);
        localStorage.setItem(this.STORAGE_KEY, lang);
        this.applyLanguage(lang);
    }

    /**
     * Apply language settings to the document
     */
    private applyLanguage(lang: Language): void {
        const htmlElement = document.documentElement;

        // Set language attribute
        htmlElement.setAttribute('lang', lang);

        // Set text direction (RTL for Arabic, LTR for English)
        htmlElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }

    /**
     * Get the language name for display
     */
    getLanguageName(lang?: Language): string {
        const targetLang = lang || this.currentLanguage();
        return targetLang === 'en' ? 'English' : 'العربية';
    }

    /**
     * Get the opposite language name (for toggle button display)
     */
    getOtherLanguageName(): string {
        return this.currentLanguage() === 'en' ? 'العربية' : 'English';
    }

    /**
     * Check if current language is RTL
     */
    isRTL(): boolean {
        return this.currentLanguage() === 'ar';
    }
}
