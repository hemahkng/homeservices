import { Injectable, inject } from '@angular/core';
import { Api } from '../../core/services/api';
import { Booking } from '../../shared/models/booking';

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