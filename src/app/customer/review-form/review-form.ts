import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Booking } from '../../shared/models/booking';
import { Loader } from '../../shared/components/loader/loader';
import { CustomerBooking } from '../services/customer-booking';

@Component({
  selector: 'app-review-form',
  imports: [FormsModule, RouterLink, Loader],
  templateUrl: './review-form.html',
  styleUrl: './review-form.scss',
})
export class ReviewForm implements OnInit {
  private svc = inject(CustomerBooking);
  private router = inject(Router);
  private bookingId = Number(inject(ActivatedRoute).snapshot.paramMap.get('bookingId'));

  booking = signal<Booking | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  rating = signal(5);
  hover = signal(0);
  comment = signal('');

  readonly stars = [1, 2, 3, 4, 5];
  private readonly labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  label = computed(() => this.labels[this.hover() || this.rating()]);

  ngOnInit() {
    this.svc.get(this.bookingId).subscribe({
      next: (b) => {
        this.booking.set(b);
        if (b.status !== 'completed') this.error.set('You can review a booking only after it is completed.');
        else if (b.review) this.error.set('You have already reviewed this booking.');
        this.loading.set(false);
      },
      error: () => { this.error.set('Booking not found'); this.loading.set(false); },
    });
  }

  submit() {
    this.saving.set(true);
    this.error.set('');
    this.svc.review(this.bookingId, this.rating(), this.comment().trim() || undefined).subscribe({
      next: () => this.router.navigateByUrl('/customer/my-bookings'),
      error: (e) => { this.error.set(e.error?.message ?? 'Could not save your review'); this.saving.set(false); },
    });
  }
}