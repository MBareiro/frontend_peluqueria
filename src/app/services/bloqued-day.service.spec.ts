import { TestBed } from '@angular/core/testing';

import { BloquedDayService } from './bloqued-day.service';

describe('BloquedDayService', () => {
  let service: BloquedDayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloquedDayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
