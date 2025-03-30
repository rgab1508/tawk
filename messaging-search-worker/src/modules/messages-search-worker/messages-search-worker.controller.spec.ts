import { Test, TestingModule } from '@nestjs/testing';
import { MessagesSearchWorkerController } from './messages-search-worker.controller';

describe('MessagesSearchWorkerController', () => {
  let controller: MessagesSearchWorkerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesSearchWorkerController],
    }).compile();

    controller = module.get<MessagesSearchWorkerController>(MessagesSearchWorkerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
