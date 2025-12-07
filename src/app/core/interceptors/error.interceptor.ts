import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../services/language.service';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP Error Interceptor
 * Catches all HTTP errors and displays user-friendly toast notifications
 * with translated error messages
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastr = inject(ToastrService);
    const languageService = inject(LanguageService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = '';
            let errorTitle = '';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                // errorTitle = languageService.translate('errors.clientError');
                errorMessage = error.error.message;
            } else {
                // Server-side error
                // errorTitle = languageService.translate('errors.serverError');

                // Try to extract error message from different response formats
                if (error.error?.message) {
                    errorMessage = error.error.message;
                } else if (error.error?.error) {
                    errorMessage = error.error.error;
                } else if (error.error?.detail) {
                    errorMessage = error.error.detail;
                } else if (typeof error.error === 'string') {
                    errorMessage = error.error;
                } else {
                    // Use status-specific messages
                    switch (error.status) {
                        case 400:
                            errorMessage = languageService.translate('errors.badRequest');
                            break;
                        case 401:
                            errorMessage = languageService.translate('errors.unauthorized');
                            break;
                        case 403:
                            errorMessage = languageService.translate('errors.forbidden');
                            break;
                        case 404:
                            errorMessage = languageService.translate('errors.notFound');
                            break;
                        case 422:
                            errorMessage = languageService.translate('errors.validationError');
                            break;
                        case 500:
                            errorMessage = languageService.translate('errors.internalServer');
                            break;
                        case 503:
                            errorMessage = languageService.translate('errors.serviceUnavailable');
                            break;
                        default:
                            errorMessage = languageService.translate('errors.unknown');
                    }
                }
            }

            // Display error toast
            toastr.error(errorMessage, errorTitle, {
                timeOut: 5000,
                closeButton: true,
                progressBar: true,
                positionClass: languageService.isRTL() ? 'toast-top-left' : 'toast-top-right'
            });

            // Log error to console for debugging
            console.error('HTTP Error:', {
                status: error.status,
                statusText: error.statusText,
                message: errorMessage,
                url: error.url,
                error: error.error
            });

            return throwError(() => error);
        })
    );
};
