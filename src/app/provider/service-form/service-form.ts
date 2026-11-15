import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category } from '../../shared/models/category';
import { ProviderService } from '../services/provider-service';

@Component({
  selector: 'app-service-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './service-form.html',
  styleUrl: './service-form.scss',
})
export class ServiceForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProviderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = this.route.snapshot.paramMap.get('id');
  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');
  presets = [30, 45, 60, 90, 120, 180];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(1)]],
    durationMin: [60, [Validators.required, Validators.min(15), Validators.max(1440)]],
    description: ['', Validators.maxLength(1000)],
  });

  ngOnInit() {
    this.api.categories().subscribe((c) => this.categories.set(c));
    if (this.id) {
      this.api.getService(this.id).subscribe({
        next: (s) =>
          this.form.patchValue({
            title: s.title,
            categoryId: s.category.id,
            price: s.price,
            durationMin: s.durationMin,
            description: s.description ?? '',
          }),
        error: () => this.error.set('Could not load this service'),
      });
    }
  }

  setDuration(n: number) { this.form.controls.durationMin.setValue(n); }

  err(name: 'title' | 'categoryId' | 'price' | 'durationMin' | 'description'): string {
    const c = this.form.controls[name];
    if (!(c.touched && c.invalid)) return '';
    if (c.hasError('required') || c.hasError('min')) {
      return { title: 'Enter a title', categoryId: 'Select a category', price: 'Enter a price of ₹1 or more', durationMin: 'Minimum 15 minutes', description: '' }[name];
    }
    if (c.hasError('minlength')) return 'At least 3 characters';
    if (c.hasError('max')) return 'Maximum 24 hours (1440 min)';
    return 'Too long';
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    const payload = { ...v, description: v.description || undefined };

    const req = this.id ? this.api.updateService(this.id, payload) : this.api.createService(payload);
    req.subscribe({
      next: () => this.router.navigateByUrl('/provider/services'),
      error: (e) => { this.error.set(e.error?.message ?? 'Save failed'); this.loading.set(false); },
    });
  }
}