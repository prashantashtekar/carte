import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartOwnerPage } from './cart-owner.page';

describe('CartOwnerPage', () => {
  let component: CartOwnerPage;
  let fixture: ComponentFixture<CartOwnerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartOwnerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartOwnerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
