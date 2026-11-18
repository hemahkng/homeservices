
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  loading = signal(false);
  success = signal(false);
  error = signal('');

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      recoveryCode: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: passwordMatchValidator,
    }
  );

  submit() {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value?.trim();
    const recoveryCode = this.form.controls.recoveryCode.value?.trim();
    const password = this.form.controls.password.value;

    if (!email || !recoveryCode || !password) {
      return;
    }

    this.loading.set(true);

    this.auth.resetPassword(email, recoveryCode, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message ||
          'Unable to reset password. Please check your email and recovery code.'
        );
      },
    });
  }
}
