import { TestBed } from '@angular/core/testing';

import { SharepointIntegrationService } from './sharepoint-integration.service';

describe('SharepointIntegrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharepointIntegrationService = TestBed.get(SharepointIntegrationService);
    expect(service).toBeTruthy();
  });
});
