import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/services/api';
import { Auth } from '../../core/services/auth';
import { Category } from '../../shared/models/category';

@Component({
  selector: 'app-register-provider',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-provider.html',
  styleUrl: './register-provider.scss',
})
export class RegisterProvider implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  private auth = inject(Auth);

  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');
  done = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    experienceYears: [0, [Validators.required, Validators.min(0), Validators.max(60)]],
    bio: ['', Validators.maxLength(500)],
  });

  ngOnInit() {
    this.api.get<Category[]>('/categories').subscribe({
      next: (c) => this.categories.set(c),
      error: () => this.error.set('Could not load categories. Is the server running?'),
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const payload: any = { ...v, role: 'provider', bio: v.bio || undefined };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Registration failed');
        this.loading.set(false);
      },
    });
  }
}