import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'provider-approvals', loadComponent: () => import('./provider-approvals/provider-approvals').then(m => m.ProviderApprovals) },
      { path: 'users', loadComponent: () => import('./users/users').then(m => m.Users) },
      { path: 'bookings', loadComponent: () => import('./bookings/bookings').then(m => m.Bookings) },
      { path: 'bookings/:id', loadComponent: () => import('./booking-detail/booking-detail').then(m => m.BookingDetail) },
      { path: 'payments', loadComponent: () => import('./payments/payments').then(m => m.Payments) },
      { path: 'payouts', loadComponent: () => import('./payouts/payouts').then(m => m.Payouts) },
      { path: 'reports', loadComponent: () => import('./reports/reports').then(m => m.Reports) },
      { path: 'categories', loadComponent: () => import('./categories/categories').then(m => m.Categories) },
      { path: 'categories/new', loadComponent: () => import('./category-form/category-form').then(m => m.CategoryForm) },
      { path: 'categories/:id/edit', loadComponent: () => import('./category-form/category-form').then(m => m.CategoryForm) },
      { path: 'settings', loadComponent: () => import('./settings/settings').then(m => m.Settings) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];