import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderApprovals } from './provider-approvals';

describe('ProviderApprovals', () => {
  let component: ProviderApprovals;
  let fixture: ComponentFixture<ProviderApprovals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderApprovals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderApprovals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
