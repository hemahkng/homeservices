import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./register-choice/register-choice').then(m => m.RegisterChoice) },
  { path: 'register/customer', loadComponent: () => import('./register/register').then(m => m.Register) },
  { path: 'register/provider', loadComponent: () => import('./register-provider/register-provider').then(m => m.RegisterProvider) },
  { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'reset-password', loadComponent: () => import('./reset-password/reset-password').then(m => m.ResetPassword) },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];