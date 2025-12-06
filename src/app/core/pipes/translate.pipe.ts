import { Pipe, PipeTransform, inject, effect, signal } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
    name: 'translate',
    standalone: true,
    pure: false // Make it impure to react to language changes
})
export class TranslatePipe implements PipeTransform {
    private languageService = inject(LanguageService);
    private lastLang = signal(this.languageService.currentLanguage());

    constructor() {
        // Update internal signal when language changes
        effect(() => {
            this.lastLang.set(this.languageService.currentLanguage());
        });
    }

    transform(key: string, params?: Record<string, string | number>): string {
        // Access the signal to trigger change detection
        this.lastLang();

        return this.languageService.translate(key, params);
    }
}
