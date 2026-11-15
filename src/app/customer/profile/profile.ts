import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { Loader } from '../../shared/components/loader/loader';
import { CustomerAccount, CustomerProfile } from '../services/customer-account';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, DatePipe, Loader],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private account = inject(CustomerAccount);
  auth = inject(Auth);

  info = signal<CustomerProfile | null>(null);
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal('');

  pwdSaving = signal(false);
  pwdOk = signal(false);
  pwdError = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', Validators.pattern(/^\d{10,15}$/)],
    address: ['', Validators.maxLength(300)],
  });

  pwd = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });

  ngOnInit() {
    this.account.profile().subscribe({
      next: (p) => { this.apply(p); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load profile'); this.loading.set(false); },
    });
  }

  private apply(p: CustomerProfile) {
    this.info.set(p);
    this.form.patchValue({ name: p.name, phone: p.phone ?? '', address: p.address ?? '' });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');
    this.account.saveProfile(this.form.getRawValue()).subscribe({
      next: (p) => {
        this.apply(p);
        this.auth.patchUser({ name: p.name, phone: p.phone ?? undefined });
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not save'); this.saving.set(false); },
    });
  }

  changePassword() {
    this.pwdError.set('');
    this.pwdOk.set(false);
    if (this.pwd.invalid) { this.pwd.markAllAsTouched(); return; }
    const v = this.pwd.getRawValue();
    if (v.newPassword !== v.confirm) { this.pwdError.set('New passwords do not match'); return; }

    this.pwdSaving.set(true);
    this.account.changePassword(v.currentPassword, v.newPassword).subscribe({
      next: () => { this.pwdSaving.set(false); this.pwdOk.set(true); this.pwd.reset(); },
      error: (e) => { this.pwdSaving.set(false); this.pwdError.set(e.error?.message ?? 'Could not change password'); },
    });
  }

  bad(group: 'form' | 'pwd', name: string): boolean {
    const g: AbstractControl = group === 'form' ? this.form : this.pwd;
    const c = g.get(name);
    return !!c && c.touched && c.invalid;
  }
}