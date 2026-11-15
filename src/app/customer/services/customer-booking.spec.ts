import { TestBed } from '@angular/core/testing';

import { CustomerBooking } from './customer-booking';

describe('CustomerBooking', () => {
  let service: CustomerBooking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerBooking);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
