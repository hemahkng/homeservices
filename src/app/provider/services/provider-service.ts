import { Injectable, inject } from '@angular/core';
import { Api } from '../../core/services/api';
import { Category } from '../../shared/models/category';
import { Service } from '../../shared/models/service';
import { Booking } from '../../shared/models/booking';

export interface UpcomingJob {
  id: number;
  scheduledAt: string;
  status: string;
  total: number;
  service: { title: string };
  customer: { name: string };
}

export interface ProviderStats {
  pending: number;
  accepted: number;
  inProgress: number;
  completed: number;
  services: number;
  availabilitySet: boolean;
  reviews: number;
  rating: number;
  earnings: number;
  net: number;
  upcoming: UpcomingJob[];
}

export interface EarningItem {
  id: number;
  amount: number;
  fee: number;
  net: number;
  paidAt: string | null;
  txnId: string | null;
  booking: { id: number; service: { title: string }; customer: { name: string } };
}

export interface EarningsResponse {
  commissionPercent: number;
  gross: number;
  fee: number;
  net: number;
  thisMonth: number;
  awaitingPayment: number;
  items: EarningItem[];
}

export interface ProviderProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  providerProfile: {
    city: string;
    experienceYears: number;
    bio: string | null;
    ratingAvg: number;
    category: { id: number; name: string };
  } | null;
}

export interface ProfilePayload {
  name: string;
  phone: string;
  city: string;
  experienceYears: number;
  bio?: string;
  categoryId: number;
}

export interface DayAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ProviderReview {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer: { name: string };
  booking: { service: { title: string } };
}

export interface ServicePayload {
  title: string;
  categoryId: number;
  price: number;
  durationMin: number;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private api = inject(Api);

  stats() { return this.api.get<ProviderStats>('/provider/stats'); }
  earnings() { return this.api.get<EarningsResponse>('/provider/earnings'); }

  profile() { return this.api.get<ProviderProfile>('/provider/profile'); }
  saveProfile(p: ProfilePayload) { return this.api.put<ProviderProfile>('/provider/profile', p); }
  changePassword(currentPassword: string, newPassword: string) {
    return this.api.post<{ ok: boolean }>('/provider/password', { currentPassword, newPassword });
  }

  availability() { return this.api.get<DayAvailability[]>('/provider/availability'); }
  saveAvailability(days: DayAvailability[]) {
    return this.api.put<DayAvailability[]>('/provider/availability', { days });
  }

  reviews() { return this.api.get<ProviderReview[]>('/reviews/mine'); }
  categories() { return this.api.get<Category[]>('/categories'); }

  myServices() { return this.api.get<Service[]>('/services/mine'); }
  getService(id: number | string) { return this.api.get<Service>(`/services/${id}`); }
  createService(p: ServicePayload) { return this.api.post<Service>('/services', p); }
  updateService(id: number | string, p: ServicePayload) { return this.api.put<Service>(`/services/${id}`, p); }
  deleteService(id: number) { return this.api.delete<{ ok: boolean }>(`/services/${id}`); }
}

export type JobAction = 'accept' | 'reject' | 'start' | 'complete';

export interface JobActionDef {
  action: JobAction;
  label: string;
  kind: 'primary' | 'danger';
  confirm?: string;
}

export function actionsFor(status: string): JobActionDef[] {
  switch (status) {
    case 'pending':
      return [
        { action: 'accept', label: 'Accept', kind: 'primary' },
        { action: 'reject', label: 'Reject', kind: 'danger', confirm: 'Reject this request?' },
      ];
    case 'accepted':
      return [{ action: 'start', label: 'Start job', kind: 'primary' }];
    case 'in_progress':
      return [{ action: 'complete', label: 'Mark complete', kind: 'primary', confirm: 'Mark this job as complete?' }];
    default:
      return [];
  }
}

@Injectable({ providedIn: 'root' })
export class ProviderBooking {
  private api = inject(Api);

  list() { return this.api.get<Booking[]>('/bookings'); }
  get(id: number | string) { return this.api.get<Booking>(`/bookings/${id}`); }
  act(id: number, action: JobAction) { return this.api.patch<Booking>(`/bookings/${id}/${action}`, {}); }
}