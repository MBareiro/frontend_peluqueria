import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronogramaComponent } from './cronograma.component';

describe('CronogramaComponent', () => {
  let component: CronogramaComponent;
  let fixture: ComponentFixture<CronogramaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CronogramaComponent]
    });
    fixture = TestBed.createComponent(CronogramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
