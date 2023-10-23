import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentCancelledComponent } from './appointment-cancelled.component';

describe('AppointmentCancelledComponent', () => {
  let component: AppointmentCancelledComponent;
  let fixture: ComponentFixture<AppointmentCancelledComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppointmentCancelledComponent]
    });
    fixture = TestBed.createComponent(AppointmentCancelledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
