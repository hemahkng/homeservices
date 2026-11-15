import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\d{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const payload: any = { ...v, role: 'customer', phone: v.phone || undefined };

    this.auth.register(payload).subscribe({
      next: () => {
        this.auth.login(v.email, v.password).subscribe({
          next: () => this.auth.goHome(),
          error: () => this.loading.set(false),
        });
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Registration failed');
        this.loading.set(false);
      },
    });
  }
}