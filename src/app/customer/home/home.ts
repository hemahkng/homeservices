import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { Booking } from '../../shared/models/booking';
import { Category } from '../../shared/models/category';
import { Service } from '../../shared/models/service';
import { Loader } from '../../shared/components/loader/loader';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { categoryIcon } from '../category-icon';
import { Catalog } from '../services/catalog';
import { CustomerBooking, canPay } from '../services/customer-booking';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, DatePipe, Loader, ServiceCard, StatusBadge],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private catalog = inject(Catalog);
  private bookings = inject(CustomerBooking);
  private router = inject(Router);
  auth = inject(Auth);

  readonly icon = categoryIcon;
  categories = signal<Category[]>([]);
  top = signal<Service[]>([]);
  next = signal<Booking | null>(null);
  due = signal(0);
  loading = signal(true);
  q = '';

  firstName = computed(() => (this.auth.currentUser()?.name ?? '').split(' ')[0]);

  ngOnInit() {
    forkJoin({
      cats: this.catalog.categories(),
      services: this.catalog.services({}),
      bookings: this.bookings.list(),
    }).subscribe({
      next: ({ cats, services, bookings }) => {
        this.categories.set(cats);
        const rating = (s: Service) => s.provider.providerProfile?.ratingAvg ?? 0;
        this.top.set([...services].sort((a, b) => rating(b) - rating(a)).slice(0, 6));

        const now = Date.now();
        const upcoming = bookings
          .filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status) && +new Date(b.scheduledAt) >= now - 3600000)
          .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
        this.next.set(upcoming[0] ?? null);
        this.due.set(bookings.filter(canPay).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  go() {
    this.router.navigate(['/customer/services'], { queryParams: { q: this.q.trim() || null } });
  }
}