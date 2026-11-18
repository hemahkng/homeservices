
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  loading = signal(false);
  success = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    this.error.set('');
    this.success.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value?.trim();

    if (!email) {
      return;
    }

    this.loading.set(true);

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message ||
          'Unable to process your request. Please try again.'
        );
      },
    });
  }
}
