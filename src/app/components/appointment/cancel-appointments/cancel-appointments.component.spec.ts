import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAppointmentsComponent } from './cancel-appointments.component';

describe('CancelAppointmentsComponent', () => {
  let component: CancelAppointmentsComponent;
  let fixture: ComponentFixture<CancelAppointmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelAppointmentsComponent]
    });
    fixture = TestBed.createComponent(CancelAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
