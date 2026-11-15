import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Booking } from '../../shared/models/booking';
import { Loader } from '../../shared/components/loader/loader';
import { CustomerBooking } from '../services/customer-booking';

@Component({
  selector: 'app-booking-confirm',
  imports: [RouterLink, DatePipe, DecimalPipe, Loader],
  templateUrl: './booking-confirm.html',
  styleUrl: './booking-confirm.scss',
})
export class BookingConfirm implements OnInit {
  private bookings = inject(CustomerBooking);
  private route = inject(ActivatedRoute);

  b = signal<Booking | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) { this.loading.set(false); return; }
    this.bookings.get(id).subscribe({
      next: (b) => { this.b.set(b); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}