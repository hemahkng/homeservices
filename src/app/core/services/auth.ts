import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Role, User } from '../../shared/models/user';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const HOME: Record<Role, string> = {
  customer: '/customer/home',
  provider: '/provider/dashboard',
  admin: '/admin/dashboard',
};

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(this.loadUser());
  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  register(data: { name: string; email: string; phone: string; password: string; role: Role }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigateByUrl('/auth/login');
  }

  goHome() {
    const user = this._user();
    this.router.navigateByUrl(user ? HOME[user.role] : '/auth/login');
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  patchUser(p: Partial<User>) {
    const u = this._user();
    if (!u) return;
    const next = { ...u, ...p };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    this._user.set(next);
  }
}