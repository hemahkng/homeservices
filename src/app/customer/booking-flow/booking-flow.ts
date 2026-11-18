
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Service } from '../../shared/models/service';
import { Loader } from '../../shared/components/loader/loader';
import { Catalog, Slot, SlotsResponse } from '../services/catalog';
import { CustomerAccount } from '../services/customer-account';
import { CustomerBooking } from '../services/customer-booking';

interface Day {
  key: string;
  num: number;
  weekday: string;
  month: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

@Component({
  selector: 'app-booking-flow',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    Loader,
    TranslatePipe
  ],
  templateUrl: './booking-flow.html',
  styleUrl: './booking-flow.scss'
})
export class BookingFlow implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(Catalog);
  private account = inject(CustomerAccount);
  private bookings = inject(CustomerBooking);
  private translate = inject(TranslateService);

  readonly serviceId = Number(this.route.snapshot.paramMap.get('serviceId'));

  readonly steps = [
    'CUSTOMER_CHECKOUT.STEP_DATE',
    'CUSTOMER_CHECKOUT.STEP_ADDRESS',
    'CUSTOMER_CHECKOUT.STEP_CONFIRM'
  ];

  readonly step = signal(1);

  readonly loadingService = signal(true);
  readonly service = signal<Service | null>(null);

  readonly days: Day[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);

    return {
      key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      num: d.getDate(),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      month: d.toLocaleDateString('en-IN', { month: 'short' })
    };
  });

  readonly date = signal(this.days[0].key);
  readonly slots = signal<Slot[]>([]);
  readonly closed = signal(false);
  readonly slotsLoading = signal(false);
  readonly slot = signal<Slot | null>(null);

  readonly address = signal('');
  readonly notes = signal('');

  readonly saving = signal(false);
  readonly error = signal('');

  readonly hasFreeSlot = computed(() =>
    this.slots().some((s: Slot) => s.available)
  );

  readonly canNext = computed(() => {
    if (this.step() === 1) {
      return !!this.slot();
    }

    if (this.step() === 2) {
      return this.address().trim().length > 0;
    }

    return true;
  });

  ngOnInit(): void {
    this.catalog.service(this.serviceId).subscribe({
      next: (s: Service) => {
        this.service.set(s);
        this.loadingService.set(false);
      },
      error: () => {
        this.error.set(
          this.translate.instant('CUSTOMER_CHECKOUT.ERROR_SERVICE')
        );
        this.loadingService.set(false);
      }
    });

    this.account.profile().subscribe({
      next: p => {
        if (p.address) {
          this.address.set(p.address);
        }
      }
    });

    this.pickDate(this.days[0].key);
  }

  pickDate(date: string): void {
    this.date.set(date);
    this.slot.set(null);
    this.slotsLoading.set(true);
    this.closed.set(false);

    this.catalog.slots(this.serviceId, date).subscribe({
      next: (res: SlotsResponse) => {
        this.slots.set(res.slots || []);
        this.closed.set(!!res.closed);
        this.slotsLoading.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.slotsLoading.set(false);
      }
    });
  }

  fmt(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);

    return d.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  next(): void {
    if (!this.canNext()) {
      return;
    }

    this.error.set('');
    this.step.update(s => Math.min(3, s + 1));
  }

  back(): void {
    this.error.set('');
    this.step.update(s => Math.max(1, s - 1));
  }

  confirm(): void {
    const selectedSlot = this.slot();
    const selectedService = this.service();

    if (!selectedSlot || !selectedService || !this.address().trim()) {
      return;
    }

    this.saving.set(true);
    this.error.set('');

    this.bookings.create({
      serviceId: this.serviceId,
      scheduledAt: selectedSlot.iso,
      address: this.address().trim(),
      notes: this.notes().trim()
    }).subscribe({
      next: booking => {
        this.saving.set(false);

        this.router.navigate(['/customer/booking-confirm'], {
          queryParams: { id: booking.id }
        });
      },
      error: (e: any) => {
        this.saving.set(false);

        this.error.set(
          e.error?.message ??
          this.translate.instant(
            e.status === 409
              ? 'CUSTOMER_CHECKOUT.SLOT_TAKEN'
              : 'CUSTOMER_CHECKOUT.BOOKING_FAILED'
          )
        );

        if (e.status === 409) {
          this.step.set(1);
          this.pickDate(this.date());
        }
      }
    });
  }
}
