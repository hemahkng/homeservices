
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Auth } from '../../core/services/auth';
import { Category } from '../../shared/models/category';
import {
  ProviderProfile,
  ProviderService
} from '../services/provider-service';

import { Loader } from '../../shared/components/loader/loader';
import { RatingStars } from '../../shared/components/rating-stars/rating-stars';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    Loader,
    RatingStars,
    TranslatePipe
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProviderService);
  private auth = inject(Auth);
  private translate = inject(TranslateService);

  info = signal<ProviderProfile | null>(null);
  categories = signal<Category[]>([]);
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
    categoryId: [0, [Validators.required, Validators.min(1)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    experienceYears: [
      0,
      [Validators.required, Validators.min(0), Validators.max(60)]
    ],
    bio: ['', Validators.maxLength(500)],
  });

  pwd = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });

  ngOnInit(): void {
    this.api.categories().subscribe({
      next: (c) => this.categories.set(c),
    });

    this.api.profile().subscribe({
      next: (p) => {
        this.apply(p);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_PROFILE.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  private apply(p: ProviderProfile): void {
    this.info.set(p);

    this.form.patchValue({
      name: p.name,
      phone: p.phone ?? '',
      categoryId: p.providerProfile?.category.id ?? 0,
      city: p.providerProfile?.city ?? '',
      experienceYears: p.providerProfile?.experienceYears ?? 0,
      bio: p.providerProfile?.bio ?? '',
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    this.api.saveProfile({
      ...v,
      bio: v.bio || undefined
    }).subscribe({
      next: (p) => {
        this.apply(p);
        this.auth.patchUser({ name: p.name });
        this.saving.set(false);
        this.saved.set(true);

        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_PROFILE.SAVE_ERROR')
        );
        this.saving.set(false);
      },
    });
  }

  changePassword(): void {
    this.pwdError.set('');
    this.pwdOk.set(false);

    if (this.pwd.invalid) {
      this.pwd.markAllAsTouched();
      return;
    }

    const v = this.pwd.getRawValue();

    if (v.newPassword !== v.confirm) {
      this.pwdError.set(
        this.translate.instant('PROVIDER_PROFILE.PASSWORD_MISMATCH')
      );
      return;
    }

    this.pwdSaving.set(true);

    this.api.changePassword(
      v.currentPassword,
      v.newPassword
    ).subscribe({
      next: () => {
        this.pwdSaving.set(false);
        this.pwdOk.set(true);
        this.pwd.reset();
      },
      error: (e) => {
        this.pwdSaving.set(false);
        this.pwdError.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_PROFILE.PASSWORD_ERROR')
        );
      },
    });
  }

  bad(group: 'form' | 'pwd', name: string): boolean {
    const c = group === 'form'
      ? this.form.get(name)
      : this.pwd.get(name);

    return !!c && c.touched && c.invalid;
  }
}
