
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Booking } from '../../shared/models/booking';
import { Loader } from '../../shared/components/loader/loader';
import { CustomerBooking } from '../services/customer-booking';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [FormsModule, RouterLink, Loader, TranslatePipe],
  templateUrl: './review-form.html',
  styleUrl: './review-form.scss',
})
export class ReviewForm implements OnInit {
  private svc = inject(CustomerBooking);
  private router = inject(Router);
  private translate = inject(TranslateService);

  private bookingId = Number(
    inject(ActivatedRoute).snapshot.paramMap.get('bookingId')
  );

  booking = signal<Booking | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  rating = signal(5);
  hover = signal(0);
  comment = signal('');

  readonly stars = [1, 2, 3, 4, 5];

  private readonly labels = [
    '',
    'CUSTOMER_REVIEW.POOR',
    'CUSTOMER_REVIEW.FAIR',
    'CUSTOMER_REVIEW.GOOD',
    'CUSTOMER_REVIEW.VERY_GOOD',
    'CUSTOMER_REVIEW.EXCELLENT',
  ];

  label = computed(() => this.labels[this.hover() || this.rating()]);

  ngOnInit(): void {
    this.svc.get(this.bookingId).subscribe({
      next: (b) => {
        this.booking.set(b);

        if (b.status !== 'completed') {
          this.error.set(
            this.translate.instant('CUSTOMER_REVIEW.COMPLETED_ONLY')
          );
        } else if (b.review) {
          this.error.set(
            this.translate.instant('CUSTOMER_REVIEW.ALREADY_REVIEWED')
          );
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          this.translate.instant('CUSTOMER_REVIEW.BOOKING_NOT_FOUND')
        );
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    this.saving.set(true);
    this.error.set('');

    this.svc.review(
      this.bookingId,
      this.rating(),
      this.comment().trim() || undefined
    ).subscribe({
      next: () => this.router.navigateByUrl('/customer/my-bookings'),
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('CUSTOMER_REVIEW.SAVE_ERROR')
        );
        this.saving.set(false);
      },
    });
  }
}
