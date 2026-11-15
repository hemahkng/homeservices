import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Role } from '../../shared/models/user';

export const roleGuard = (roles: Role[]): CanActivateFn => () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const role = auth.currentUser()?.role;
  return (role && roles.includes(role)) || router.createUrlTree(['/auth/login']);
};