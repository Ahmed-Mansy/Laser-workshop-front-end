import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { LanguageService } from './core/services/language.service';
import { provideToastr } from 'ngx-toastr';

/**
 * Initialize translations before app starts
 */
function initializeTranslations(languageService: LanguageService) {
    return () => languageService.loadTranslations();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
        provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])),
        provideAnimations(),
        provideToastr({
            timeOut: 5000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
            closeButton: true,
            progressBar: true,
            progressAnimation: 'decreasing',
            tapToDismiss: true,
            maxOpened: 3,
            autoDismiss: true,
            newestOnTop: true
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeTranslations,
            deps: [LanguageService],
            multi: true
        }
    ]
};
