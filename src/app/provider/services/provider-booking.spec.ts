import { TestBed } from '@angular/core/testing';

import { ProviderBooking } from './provider-booking';

describe('ProviderBooking', () => {
  let service: ProviderBooking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProviderBooking);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
