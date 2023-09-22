import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAppointmentsComponent } from './list-appointments.component';

describe('ListAppointmentsComponent', () => {
  let component: ListAppointmentsComponent;
  let fixture: ComponentFixture<ListAppointmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListAppointmentsComponent]
    });
    fixture = TestBed.createComponent(ListAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
