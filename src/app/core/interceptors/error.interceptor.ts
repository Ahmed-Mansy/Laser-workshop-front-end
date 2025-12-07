import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../services/language.service';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastr = inject(ToastrService);
    const languageService = inject(LanguageService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {

            let errorMessage = '';
            // Default title
            let errorTitle = '';
            // errorTitle = languageService.translate('errors.serverError');

            // ---------------------------------------------------------
            // Handle Django Validation Errors (400 Bad Request)
            // ---------------------------------------------------------
            if (error.status === 400 && error.error && typeof error.error === 'object') {
                // Determine where the validation errors are located.
                // Some backends return { "field": ["err"] }, others { "message": "...", "errors": { "field": ["err"] } }
                let validationErrors = error.error;
                if ((error.error as any).errors && typeof (error.error as any).errors === 'object') {
                    validationErrors = (error.error as any).errors;
                }

                const firstField = Object.keys(validationErrors)[0];

                // Example: { "status": ["messages.priceRequired"] }
                if (firstField && validationErrors[firstField] && Array.isArray(validationErrors[firstField])) {
                    // 1. Get the raw string (e.g. "messages.priceRequired")
                    const rawError = String(validationErrors[firstField][0]).trim();

                    // 2. Translate it using your LanguageService
                    const translatedError = languageService.translate(rawError);

                    // --- LOGIC TO FIX THE DISPLAY ---
                    // If the field is named "status", we DO NOT want to show "status: ..."
                    // We just want the message.
                    if (firstField.toLowerCase() === 'status') {
                        errorMessage = translatedError;
                    }
                    // If the message looks like a translation key (has a dot), show it directly
                    else if (rawError.includes('.') && !rawError.includes(' ')) {
                        errorMessage = translatedError;
                    }
                    else {
                        // For other fields (like "phone", "email"), keep the field name
                        // Result: "phone: Invalid format"
                        const translatedField = languageService.translate(firstField);
                        errorMessage = `${translatedField}: ${translatedError}`;
                    }

                    // Preserve structure for components (ensure standard structure exists)
                    if (!(error.error as any).errors) {
                        // If it was flat, we wrap it so components like orders.ts can rely on error.error.errors
                        (error.error as any).errors = validationErrors;
                    }
                    if (!(error.error as any).message) {
                        (error.error as any).message = errorMessage;
                    }
                }
            }

            // ---------------------------------------------------------
            // Fallback for other errors
            // ---------------------------------------------------------
            if (!errorMessage) {
                if (error.error?.message) errorMessage = error.error.message;
                else if (error.error?.detail) errorMessage = error.error.detail;
                else if (typeof error.error === 'string') errorMessage = error.error;
                else errorMessage = languageService.translate('errors.unknown');

                // Try to translate if it looks like a key
                if (errorMessage && errorMessage.includes('.') && !errorMessage.includes(' ')) {
                    errorMessage = languageService.translate(errorMessage);
                }
            }

            // ---------------------------------------------------------
            // Show Toastr
            // ---------------------------------------------------------
            toastr.error(
                errorMessage,
                errorTitle,
                {
                    timeOut: 5000,
                    closeButton: true,
                    progressBar: true,
                    positionClass: languageService.isRTL() ? 'toast-top-left' : 'toast-top-right'
                }
            );

            return throwError(() => error);
        })
    );
};