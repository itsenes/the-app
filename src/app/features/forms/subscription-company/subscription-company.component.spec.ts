import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionCompanyComponent } from './subscription-company.component';

describe('SubscriptionCompanyComponent', () => {
  let component: SubscriptionCompanyComponent;
  let fixture: ComponentFixture<SubscriptionCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
