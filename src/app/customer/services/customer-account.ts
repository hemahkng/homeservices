import { Injectable, inject } from '@angular/core';
import { Api } from '../../core/services/api';

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  totalBookings: number;
  completedBookings: number;
}

export interface ProfilePayload { name: string; phone: string; address: string; }

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerAccount {
  private api = inject(Api);

  profile() { return this.api.get<CustomerProfile>('/customer/profile'); }
  saveProfile(p: ProfilePayload) { return this.api.put<CustomerProfile>('/customer/profile', p); }
  changePassword(currentPassword: string, newPassword: string) {
    return this.api.post<{ ok: boolean }>('/customer/password', { currentPassword, newPassword });
  }

  notifications() { return this.api.get<AppNotification[]>('/notifications'); }
  unreadCount() { return this.api.get<{ count: number }>('/notifications/unread-count'); }
  markRead(id: number) { return this.api.patch<{ ok: boolean }>(`/notifications/${id}/read`, {}); }
  markAllRead() { return this.api.patch<{ ok: boolean }>('/notifications/read-all', {}); }
}