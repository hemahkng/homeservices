import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Service } from '../../shared/models/service';
import { Loader } from '../../shared/components/loader/loader';
import { Catalog, Slot } from '../services/catalog';
import { CustomerAccount } from '../services/customer-account';
import { CustomerBooking } from '../services/customer-booking';

interface Day { key: string; weekday: string; num: number; month: string; }
const pad = (n: number) => String(n).padStart(2, '0');

@Component({
  selector: 'app-booking-flow',
  imports: [FormsModule, DatePipe, DecimalPipe, RouterLink, Loader],
  templateUrl: './booking-flow.html',
  styleUrl: './booking-flow.scss',
})
export class BookingFlow implements OnInit {
  private catalog = inject(Catalog);
  private bookings = inject(CustomerBooking);
  private account = inject(CustomerAccount);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  serviceId = Number(this.route.snapshot.paramMap.get('serviceId'));
  service = signal<Service | null>(null);
  loadingService = signal(true);

  readonly steps = ['Date & time', 'Address', 'Confirm'];
  step = signal(1);

  readonly days: Day[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      weekday: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      num: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
    };
  });

  date = signal('');
  slots = signal<Slot[]>([]);
  closed = signal(false);
  slotsLoading = signal(false);
  slot = signal<Slot | null>(null);

  address = signal('');
  notes = signal('');

  saving = signal(false);
  error = signal('');

  hasFreeSlot = computed(() => this.slots().some((s) => s.available));
  canNext = computed(() =>
    this.step() === 1 ? !!this.slot() : this.step() === 2 ? this.address().trim().length >= 5 : true
  );

  ngOnInit() {
    this.catalog.service(this.serviceId).subscribe({
      next: (s) => { this.service.set(s); this.loadingService.set(false); },
      error: () => { this.error.set('This service is not available.'); this.loadingService.set(false); },
    });
    this.account.profile().subscribe({ next: (p) => { if (p.address) this.address.set(p.address); }, error: () => {} });
    this.pickDate(this.days[0].key);
  }

  pickDate(key: string) {
    this.date.set(key);
    this.slot.set(null);
    this.slotsLoading.set(true);
    this.catalog.slots(this.serviceId, key).subscribe({
      next: (r) => { this.slots.set(r.slots); this.closed.set(r.closed); this.slotsLoading.set(false); },
      error: () => { this.slots.set([]); this.slotsLoading.set(false); },
    });
  }

  fmt(t: string) {
    const h = Number(t.slice(0, 2));
    return `${h % 12 || 12}:${t.slice(3, 5)} ${h < 12 ? 'AM' : 'PM'}`;
  }

  next() { if (this.canNext() && this.step() < 3) this.step.update((s) => s + 1); }
  back() { if (this.step() > 1) this.step.update((s) => s - 1); }

  confirm() {
    const s = this.slot();
    if (!s) return;
    this.saving.set(true);
    this.error.set('');
    this.bookings
      .create({
        serviceId: this.serviceId,
        scheduledAt: s.iso,
        address: this.address().trim(),
        notes: this.notes().trim() || undefined,
      })
      .subscribe({
        next: (b) => this.router.navigate(['/customer/booking-confirm'], { queryParams: { id: b.id } }),
        error: (e) => {
          this.error.set(e.error?.message ?? 'Booking failed. Please try again.');
          this.saving.set(false);
          if (e.status === 409) { this.step.set(1); this.pickDate(this.date()); } // slot was taken
        },
      });
  }
}