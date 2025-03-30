import { Test, TestingModule } from '@nestjs/testing';
import { MessagesSearchWorkerService } from './messages-search-worker.service';

describe('MessagesSearchWorkerService', () => {
  let service: MessagesSearchWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesSearchWorkerService],
    }).compile();

    service = module.get<MessagesSearchWorkerService>(MessagesSearchWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
