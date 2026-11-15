import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApi } from '../services/admin';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(AdminApi);
  private router = inject(Router);

  id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    icon: [''],
    isActive: [true],
  });

  ngOnInit() {
    if (!this.id) return;
    this.api.categories().subscribe({
      next: (list) => {
        const c = list.find((x) => x.id === Number(this.id));
        if (!c) { this.error.set('Category not found'); return; }
        this.form.patchValue({ name: c.name, icon: c.icon ?? '', isActive: c.isActive });
      },
      error: () => this.error.set('Could not load category'),
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    const body = { name: v.name.trim(), icon: v.icon.trim() || undefined };
    const req = this.id ? this.api.updateCategory(this.id, { ...body, isActive: v.isActive }) : this.api.createCategory(body);
    req.subscribe({
      next: () => this.router.navigateByUrl('/admin/categories'),
      error: (e) => { this.error.set(e.error?.message ?? 'Save failed'); this.loading.set(false); },
    });
  }
}