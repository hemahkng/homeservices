import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Service } from '../../shared/models/service';
import { ProviderService } from '../services/provider-service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-my-services',
  imports: [RouterLink, DecimalPipe, Loader, EmptyState],
  templateUrl: './my-services.html',
  styleUrl: './my-services.scss',
})
export class MyServices implements OnInit {
  private api = inject(ProviderService);

  items = signal<Service[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.api.myServices().subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load services'); this.loading.set(false); },
    });
  }

  duration(min: number) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  remove(s: Service) {
    if (!confirm(`Delete "${s.title}"? Customers will no longer be able to book it.`)) return;
    this.busyId.set(s.id);
    this.api.deleteService(s.id).subscribe({
      next: () => { this.busyId.set(null); this.items.update((l) => l.filter((x) => x.id !== s.id)); },
      error: (e) => { this.busyId.set(null); this.error.set(e.error?.message ?? 'Delete failed'); },
    });
  }
}