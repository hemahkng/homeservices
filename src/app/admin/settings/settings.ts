import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loader } from '../../shared/components/loader/loader';
import { AdminApi } from '../services/admin';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, Loader],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(AdminApi);

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    platformName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    commissionPercent: [10, [Validators.required, Validators.min(0), Validators.max(50)]],
    supportEmail: ['', Validators.email],
    supportPhone: ['', Validators.pattern(/^\d{10,15}$/)],
  });

  ngOnInit() {
    this.api.settings().subscribe({
      next: (s) => { this.form.patchValue(s); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load settings'); this.loading.set(false); },
    });
  }

  bad(name: 'platformName' | 'commissionPercent' | 'supportEmail' | 'supportPhone') {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');
    this.api.saveSettings(this.form.getRawValue()).subscribe({
      next: (s) => {
        this.form.patchValue(s);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not save'); this.saving.set(false); },
    });
  }
}