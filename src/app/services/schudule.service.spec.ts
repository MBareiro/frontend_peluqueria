import { TestBed } from '@angular/core/testing';

import { SchuduleService } from './schedule.service';

describe('SchuduleService', () => {
  let service: SchuduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchuduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
