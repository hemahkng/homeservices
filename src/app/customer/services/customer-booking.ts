import { Injectable, inject } from '@angular/core';
import { Api } from '../../core/services/api';
import { Booking } from '../../shared/models/booking';

export interface BookingPayload {
  serviceId: number;
  scheduledAt: string;
  address: string;
  notes?: string;
}

export const canPay = (b: Booking) =>
  ['accepted', 'in_progress', 'completed'].includes(b.status) && b.payment?.status !== 'paid';
export const canCancel = (b: Booking) => ['pending', 'accepted'].includes(b.status);
export const canRate = (b: Booking) => b.status === 'completed' && !b.review;

@Injectable({ providedIn: 'root' })
export class CustomerBooking {
  private api = inject(Api);

  list() { return this.api.get<Booking[]>('/bookings'); }
  get(id: number | string) { return this.api.get<Booking>(`/bookings/${id}`); }
  create(p: BookingPayload) { return this.api.post<Booking>('/bookings', p); }
  cancel(id: number) { return this.api.patch<Booking>(`/bookings/${id}/cancel`, {}); }
  review(bookingId: number, rating: number, comment?: string) {
    return this.api.post('/reviews', { bookingId, rating, comment });
  }
}