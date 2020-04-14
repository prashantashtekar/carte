import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCartPage } from './assign-cart.page';

describe('AssignCartPage', () => {
  let component: AssignCartPage;
  let fixture: ComponentFixture<AssignCartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignCartPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
