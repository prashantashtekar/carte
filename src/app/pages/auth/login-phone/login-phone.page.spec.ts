import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPhonePage } from './login-phone.page';

describe('LoginPhonePage', () => {
  let component: LoginPhonePage;
  let fixture: ComponentFixture<LoginPhonePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginPhonePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPhonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
