import { TestBed } from '@angular/core/testing';

import { CustomerAccount } from './customer-account';

describe('CustomerAccount', () => {
  let service: CustomerAccount;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerAccount);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
