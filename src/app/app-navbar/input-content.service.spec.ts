import { TestBed, inject } from '@angular/core/testing';

import { InputContentService } from './input-content.service';

describe('InputContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputContentService]
    });
  });

  it('should be created', inject([InputContentService], (service: InputContentService) => {
    expect(service).toBeTruthy();
  }));
});
