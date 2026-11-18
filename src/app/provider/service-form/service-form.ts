
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Category } from '../../shared/models/category';
import { ProviderService } from '../services/provider-service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './service-form.html',
  styleUrl: './service-form.scss',
})
export class ServiceForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProviderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  id = this.route.snapshot.paramMap.get('id');

  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');

  presets = [30, 45, 60, 90, 120, 180];

  form = this.fb.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]
    ],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(1)]],
    durationMin: [
      60,
      [
        Validators.required,
        Validators.min(15),
        Validators.max(1440)
      ]
    ],
    description: ['', Validators.maxLength(1000)],
  });

  ngOnInit(): void {
    this.api.categories().subscribe({
      next: (c) => this.categories.set(c),
    });

    if (this.id) {
      this.api.getService(this.id).subscribe({
        next: (s) => {
          this.form.patchValue({
            title: s.title,
            categoryId: s.category.id,
            price: s.price,
            durationMin: s.durationMin,
            description: s.description ?? '',
          });
        },
        error: () => {
          this.error.set(
            this.translate.instant('PROVIDER_SERVICE_FORM.LOAD_ERROR')
          );
        },
      });
    }
  }

  setDuration(n: number): void {
    this.form.controls.durationMin.setValue(n);
  }

  err(
    name: 'title' | 'categoryId' | 'price' | 'durationMin' | 'description'
  ): string {
    const c = this.form.controls[name];

    if (!(c.touched && c.invalid)) {
      return '';
    }

    if (c.hasError('required') || c.hasError('min')) {
      const messages = {
        title: 'PROVIDER_SERVICE_FORM.TITLE_REQUIRED',
        categoryId: 'PROVIDER_SERVICE_FORM.CATEGORY_REQUIRED',
        price: 'PROVIDER_SERVICE_FORM.PRICE_REQUIRED',
        durationMin: 'PROVIDER_SERVICE_FORM.DURATION_MIN',
        description: '',
      };

      return this.translate.instant(messages[name]);
    }

    if (c.hasError('minlength')) {
      return this.translate.instant('PROVIDER_SERVICE_FORM.TITLE_MIN');
    }

    if (c.hasError('max')) {
      return this.translate.instant('PROVIDER_SERVICE_FORM.DURATION_MAX');
    }

    return this.translate.instant('PROVIDER_SERVICE_FORM.TOO_LONG');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    const payload = {
      ...v,
      description: v.description || undefined
    };

    const req = this.id
      ? this.api.updateService(this.id, payload)
      : this.api.createService(payload);

    req.subscribe({
      next: () => {
        this.router.navigateByUrl('/provider/services');
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_SERVICE_FORM.SAVE_ERROR')
        );
        this.loading.set(false);
      },
    });
  }
}
