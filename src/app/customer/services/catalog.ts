import { Injectable, inject } from '@angular/core';
import { Api } from '../../core/services/api';
import { Category } from '../../shared/models/category';
import { Service } from '../../shared/models/service';

export interface ServiceQuery { categoryId?: number; q?: string; }
export interface Slot { time: string; iso: string; available: boolean; }
export interface SlotsResponse { closed: boolean; slots: Slot[]; }

export interface PublicProvider {
  id: number;
  name: string;
  createdAt: string;
  completedJobs: number;
  reviewCount: number;
  providerProfile: {
    city: string;
    experienceYears: number;
    bio: string | null;
    ratingAvg: number;
    category: { id: number; name: string };
  } | null;
  services: {
    id: number;
    title: string;
    price: number;
    durationMin: number;
    description: string | null;
    category: { name: string };
  }[];
  reviews: {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    customer: { name: string };
    booking: { service: { title: string } };
  }[];
}

@Injectable({ providedIn: 'root' })
export class Catalog {
  private api = inject(Api);

  categories() { return this.api.get<Category[]>('/categories'); }

  services(q: ServiceQuery = {}) {
    const p = new URLSearchParams();
    if (q.categoryId) p.set('categoryId', String(q.categoryId));
    if (q.q?.trim()) p.set('q', q.q.trim());
    const qs = p.toString();
    return this.api.get<Service[]>(`/services${qs ? '?' + qs : ''}`);
  }

  service(id: number | string) { return this.api.get<Service>(`/services/${id}`); }
  provider(id: number | string) { return this.api.get<PublicProvider>(`/providers/${id}`); }
  slots(serviceId: number, date: string) {
    return this.api.get<SlotsResponse>(`/services/${serviceId}/slots?date=${date}`);
  }
}