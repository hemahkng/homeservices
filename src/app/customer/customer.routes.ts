import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: 'home', loadComponent: () => import('./home/home').then(m => m.Home) },
      { path: 'services', loadComponent: () => import('./service-list/service-list').then(m => m.ServiceList) },
      { path: 'services/:id', loadComponent: () => import('./service-detail/service-detail').then(m => m.ServiceDetail) },
      { path: 'providers/:id', loadComponent: () => import('./provider-profile/provider-profile').then(m => m.ProviderProfile) },
      { path: 'book/:serviceId', loadComponent: () => import('./booking-flow/booking-flow').then(m => m.BookingFlow) },
      { path: 'booking-confirm', loadComponent: () => import('./booking-confirm/booking-confirm').then(m => m.BookingConfirm) },
      { path: 'my-bookings', loadComponent: () => import('./my-bookings/my-bookings').then(m => m.MyBookings) },
      { path: 'bookings/:id', loadComponent: () => import('./booking-detail/booking-detail').then(m => m.BookingDetail) },
      { path: 'payment/:bookingId', loadComponent: () => import('./payment/payment').then(m => m.Payment) },
      { path: 'review/:bookingId', loadComponent: () => import('./review-form/review-form').then(m => m.ReviewForm) },
      { path: 'notifications', loadComponent: () => import('./notifications/notifications').then(m => m.Notifications) },
      { path: 'profile', loadComponent: () => import('./profile/profile').then(m => m.Profile) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];