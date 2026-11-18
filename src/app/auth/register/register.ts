
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private translate = inject(TranslateService);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\d{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    const payload: any = {
      ...v,
      role: 'customer',
      phone: v.phone || undefined,
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.auth.login(v.email, v.password).subscribe({
          next: () => this.auth.goHome(),
          error: () => {
            this.loading.set(false);
            this.error.set(
              this.translate.instant('AUTH_REGISTER.REGISTER_ERROR')
            );
          },
        });
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('AUTH_REGISTER.REGISTER_ERROR')
        );
        this.loading.set(false);
      },
    });
  }
}
