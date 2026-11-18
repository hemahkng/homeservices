
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Auth } from '../../core/services/auth';

const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);

  loading = signal(false);
  success = signal(false);
  error = signal('');

  private token = this.route.snapshot.queryParamMap.get('token') || '';

  form = this.fb.group(
    {
      password: ['', [
        Validators.required,
        Validators.minLength(6),
      ]],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: passwordMatchValidator,
    }
  );

  submit() {
    this.error.set('');

    if (!this.token) {
      this.error.set(
        'Reset link is missing. Please request a new password reset.'
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const password = this.form.controls.password.value;

    if (!password) {
      return;
    }

    this.loading.set(true);

    this.auth.resetPassword(this.token, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message ||
          'Unable to reset password. Please request a new link.'
        );
      },
    });
  }
}
