import { Routes } from '@angular/router';

export const PROVIDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'services', loadComponent: () => import('./my-services/my-services').then(m => m.MyServices) },
      { path: 'services/new', loadComponent: () => import('./service-form/service-form').then(m => m.ServiceForm) },
      { path: 'services/:id/edit', loadComponent: () => import('./service-form/service-form').then(m => m.ServiceForm) },
      { path: 'availability', loadComponent: () => import('./availability/availability').then(m => m.Availability) },
      { path: 'requests', loadComponent: () => import('./requests/requests').then(m => m.Requests) },
      { path: 'jobs/:id', loadComponent: () => import('./job-detail/job-detail').then(m => m.JobDetail) },
      { path: 'earnings', loadComponent: () => import('./earnings/earnings').then(m => m.Earnings) },
      { path: 'reviews', loadComponent: () => import('./reviews/reviews').then(m => m.Reviews) },
      { path: 'profile', loadComponent: () => import('./profile/profile').then(m => m.Profile) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];