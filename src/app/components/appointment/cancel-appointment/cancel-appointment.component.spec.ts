import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAppointmentComponent } from './cancel-appointment.component';

describe('CancelAppointmentComponent', () => {
  let component: CancelAppointmentComponent;
  let fixture: ComponentFixture<CancelAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelAppointmentComponent]
    });
    fixture = TestBed.createComponent(CancelAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
