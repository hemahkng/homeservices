import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Service } from '../../models/service';
import { categoryIcon } from '../../../customer/category-icon';
import { RatingStars } from '../rating-stars/rating-stars';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, DecimalPipe, RatingStars],
  template: `
    <a class="sc" [routerLink]="['/customer/services', service().id]">
      <div class="top">
        <span class="ic">{{ icon() }}</span>
        <span class="chip">{{ service().category.name }}</span>
      </div>
      <h3>{{ service().title }}</h3>
      <div class="by">by {{ service().provider.name }}@if (city()) { · {{ city() }} }</div>
      <div class="rate">
        @if (rating() > 0) {
          <app-rating-stars [value]="rating()" [size]="14" />
          <span>{{ rating() | number: '1.1-1' }}</span>
        } @else {
          <span class="new">New provider</span>
        }
      </div>
      <div class="foot">
        <b>₹{{ service().price | number }}</b>
        <small>{{ duration() }}</small>
      </div>
    </a>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .sc {
      display: flex; flex-direction: column; gap: 8px; height: 100%; padding: 16px; color: inherit;
      background: #fff; border: 1px solid var(--cu-line, #e6e9f0); border-radius: 16px;
      box-shadow: var(--cu-shadow, 0 1px 3px rgba(16,24,40,.06)); text-decoration: none;
      transition: transform .12s, box-shadow .15s;
    }
    .sc:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(16, 24, 40, .1); text-decoration: none; }
    .top { display: flex; align-items: center; justify-content: space-between; }
    .ic { width: 42px; height: 42px; border-radius: 12px; background: var(--cu-primary-soft, #edf2ff); display: grid; place-items: center; font-size: 22px; }
    .chip { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: var(--cu-bg, #f4f6fb); color: var(--cu-muted, #6b7686); }
    h3 { margin: 4px 0 0; font-size: 16px; line-height: 1.3; color: var(--cu-ink, #1c2434); }
    .by { font-size: 13px; color: var(--cu-muted, #6b7686); }
    .rate { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--cu-muted, #6b7686); flex: 1; }
    .new { color: var(--cu-primary, #4263eb); font-weight: 600; }
    .foot { display: flex; align-items: baseline; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--cu-line, #e6e9f0); }
    .foot b { font-size: 18px; color: var(--cu-ink, #1c2434); }
    .foot small { color: var(--cu-muted, #6b7686); }
  `,
})
export class ServiceCard {
  service = input.required<Service>();

  icon = computed(() => categoryIcon(this.service().category.name));
  city = computed(() => this.service().provider.providerProfile?.city ?? '');
  rating = computed(() => this.service().provider.providerProfile?.ratingAvg ?? 0);
  duration = computed(() => {
    const m = this.service().durationMin;
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${r} min` : `${h} h`;
  });
}