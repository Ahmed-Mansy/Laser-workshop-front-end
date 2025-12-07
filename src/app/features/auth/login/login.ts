import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private languageService = inject(LanguageService);

  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(this.languageService.translate('messages.loginSuccess') || 'Login successful! Redirecting...', this.languageService.translate('common.close'), { duration: 2000 });

          // Reload page to ensure all auth state (signals, localStorage, guards) sync properly
          // This is a standard pattern to avoid timing issues with async auth state
          setTimeout(() => {
            const targetUrl = response.user.role === 'MANAGER' ? '/manager' : '/worker';
            // Use window.location to force full reload
            window.location.href = targetUrl;
          }, 500);
        },
        error: (error) => {
          this.isLoading = false;
          // Prefer 'detail' from DRF, then 'error', then fallback
          // If the backend returns a translation key (e.g. 'messages.invalidCredentials'), translate it.
          const rawError = error.error?.detail || error.error?.error || 'messages.invalidCredentials';
          const message = this.languageService.translate(rawError);

          this.snackBar.open(message, this.languageService.translate('common.close'), { duration: 5000 });
        }
      });
    }
  }
}
