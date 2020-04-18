import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRequestPage } from './customer-request.page';

describe('CustomerRequestPage', () => {
  let component: CustomerRequestPage;
  let fixture: ComponentFixture<CustomerRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerRequestPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
