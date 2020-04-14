import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCartPage } from './add-cart.page';

describe('AddCartPage', () => {
  let component: AddCartPage;
  let fixture: ComponentFixture<AddCartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCartPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
