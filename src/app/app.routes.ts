import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard(['customer'])],
    loadChildren: () => import('./customer/customer.routes').then(m => m.CUSTOMER_ROUTES),
  },
  {
    path: 'provider',
    canActivate: [authGuard, roleGuard(['provider'])],
    loadChildren: () => import('./provider/provider.routes').then(m => m.PROVIDER_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];