
import { Injectable, inject } from '@angular/core';
import { Api } from '../../core/services/api';

export interface AdminStats {
  customers: number;
  providers: number;
  pendingProviders: number;
  blocked: number;
  bookings: Record<string, number | undefined>;
  revenue: number;
  commission: number;
  commissionPercent: number;
  recent: {
    id: number; status: string; total: number; scheduledAt: string;
    service: { title: string }; customer: { name: string }; provider: { name: string };
  }[];
  pendingList: {
    id: number; name: string; createdAt: string;
    providerProfile: { city: string; category: { name: string } } | null;
  }[];
  series: { date: string; label: string; count: number }[];
}

export interface ProviderRow {
  id: number; name: string; email: string; phone: string | null; status: string; createdAt: string;
  providerProfile: { city: string; experienceYears: number; bio: string | null; category: { id: number; name: string } } | null;
}

export interface UserRow {
  id: number; name: string; email: string; phone: string | null; role: string; status: string; createdAt: string;
  providerProfile: { city: string; category: { name: string } } | null;
  _count: { customerBookings: number; providerBookings: number };
}

export interface AdminBooking {
  id: number; scheduledAt: string; createdAt: string; address: string; notes: string | null; total: number; status: string;
  service: { id: number; title: string; durationMin: number; category: { name: string } };
  customer: { id: number; name: string; phone: string | null; email: string };
  provider: { id: number; name: string; phone: string | null; email: string };
  payment: {
    status: string;
    amount: number;
    paidAmount: number;
    txnId: string | null;
    orderId: string;
    paidAt: string | null;
  } | null;
  review: { rating: number; comment: string | null } | null;
}

export interface PaymentTransaction {
  id: number;
  paymentId: number;
  txnId: string;
  amount: number;
  verifiedAmount: number | null;
  status: string;
  adminRemarks: string | null;
  createdAt: string;
  verifiedAt: string | null;

  paymentRequest?: {
    reference: string;
    amount: number;
    status: string;
    createdAt: string;
    submittedAt: string | null;
  } | null;
}

export interface AdminPayment {
  id: number;
  amount: number;
  paidAmount: number;
  status: string;
  txnId: string | null;
  orderId: string;
  createdAt: string;
  paidAt: string | null;
  transactions: PaymentTransaction[];
  booking: {
    id: number;
    service: { title: string };
    customer: { name: string };
    provider: { name: string };
  };
}

export interface PaymentsResponse {
  paidTotal: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  rejectedCount: number;
  items: AdminPayment[];
}

export interface BalanceRow {
  providerId: number; name: string; email: string; phone: string | null;
  gross: number; fee: number; net: number; paidOut: number; due: number;
}

export interface PayoutRow {
  id: number; amount: number; reference: string | null; createdAt: string;
  provider: { name: string };
}

export interface ReportData {
  days: number;
  commissionPercent: number;
  summary: {
    revenue: number; commission: number; bookings: number;
    completed: number; avgOrder: number; cancelRate: number;
  };
  daily: { date: string; label: string; revenue: number; bookings: number }[];
  byStatus: Record<string, number>;
  topCategories: { name: string; bookings: number; value: number }[];
  topProviders: { id: number; name: string; revenue: number; jobs: number }[];
}

export interface PlatformSettings {
  platformName: string;
  commissionPercent: number;
  supportEmail: string;
  supportPhone: string;
}

export interface AdminCategory {
  id: number; name: string; icon: string | null; isActive: boolean;
  _count: { services: number; providers: number };
}

const qs = (o: Record<string, string | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  const s = p.toString();
  return s ? '?' + s : '';
};

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private api = inject(Api);

  badges() {
    return this.api.get<{ pendingProviders: number }>('/admin/badges');
  }

  stats() {
    return this.api.get<AdminStats>('/admin/stats');
  }

  providers(status: string) {
    return this.api.get<ProviderRow[]>(`/admin/providers${qs({ status })}`);
  }

  approve(id: number) {
    return this.api.patch(`/admin/providers/${id}/approve`, {});
  }

  reject(id: number) {
    return this.api.patch(`/admin/providers/${id}/reject`, {});
  }

  users(f: { role?: string; status?: string; q?: string }) {
    return this.api.get<UserRow[]>(`/admin/users${qs(f)}`);
  }

  block(id: number) {
    return this.api.patch(`/admin/users/${id}/block`, {});
  }

  unblock(id: number) {
    return this.api.patch(`/admin/users/${id}/unblock`, {});
  }

  bookings(f: { status?: string; q?: string }) {
    return this.api.get<AdminBooking[]>(`/admin/bookings${qs(f)}`);
  }

  booking(id: number | string) {
    return this.api.get<AdminBooking>(`/admin/bookings/${id}`);
  }

  cancelBooking(id: number) {
    return this.api.patch<AdminBooking>(`/admin/bookings/${id}/cancel`, {});
  }

  payments() {
    return this.api.get<PaymentsResponse>('/admin/payments');
  }

  verifyPayment(
    bookingId: number,
    reference: string,
    transactionId: string,
    verifiedAmount: number,
    adminRemarks?: string
  ) {
    return this.api.post('/payments/admin/verify', {
      bookingId,
      reference,
      transactionId,
      verifiedAmount,
      adminRemarks
    });
  }

  balances() {
    return this.api.get<BalanceRow[]>('/admin/payouts');
  }

  payoutHistory() {
    return this.api.get<PayoutRow[]>('/admin/payouts/history');
  }

  createPayout(p: { providerId: number; amount: number; reference?: string }) {
    return this.api.post('/admin/payouts', p);
  }

  reports(days: number) {
    return this.api.get<ReportData>(`/admin/reports?days=${days}`);
  }

  settings() {
    return this.api.get<PlatformSettings>('/admin/settings');
  }

  saveSettings(s: PlatformSettings) {
    return this.api.put<PlatformSettings>('/admin/settings', s);
  }

  categories() {
    return this.api.get<AdminCategory[]>('/admin/categories');
  }

  createCategory(p: { name: string; icon?: string }) {
    return this.api.post<AdminCategory>('/admin/categories', p);
  }

  updateCategory(
    id: number | string,
    p: { name: string; icon?: string; isActive?: boolean }
  ) {
    return this.api.put<AdminCategory>(`/admin/categories/${id}`, p);
  }
}
