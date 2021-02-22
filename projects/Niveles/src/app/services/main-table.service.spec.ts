import { TestBed } from '@angular/core/testing';

import { MainTableService } from './main-table.service';

describe('MainTableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MainTableService = TestBed.get(MainTableService);
    expect(service).toBeTruthy();
  });
});
