import { Test, TestingModule } from '@nestjs/testing';
import { MessagesRepository } from './messages.repository';
import { Messages, MessagesModel } from '../entities/messages.entity';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { unwatchFile } from 'fs';

describe('MessagesRepository', () => {
  let repository: MessagesRepository;
  let model: Model<Messages>;

  // @ts-ignore
  const mockMessage: Messages = {
    id: uuidv4(),
    conversationId: uuidv4(),
    senderId: uuidv4(),
    content: 'Test message',
    metadata: {
      type: 'text',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesRepository,
        {
          provide: getModelToken('Messages'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            insertMany: jest.fn(),
            deleteMany: jest.fn(),
            aggregate: jest.fn(),
            distinct: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MessagesRepository>(MessagesRepository);
    model = module.get<Model<Messages>>(getModelToken('Messages'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('should return an array of messages', async () => {
      const mockMessages = [mockMessage];
      const filter = { conversationId: mockMessage.conversationId };
      const projection = { content: 1 };
      const options = { sort: { timestamp: -1 } };

      jest.spyOn(model, 'find').mockResolvedValue(mockMessages);

      const result = await repository.find(filter, projection, options);

      expect(result).toEqual(mockMessages);
      expect(model.find).toHaveBeenCalledWith(filter, projection, options);
    });
  });

  describe('findById', () => {
    it('should return a message by id', async () => {
      const projection = { content: 1 };
      const options = { lean: true };

      jest.spyOn(model, 'findById').mockResolvedValue(mockMessage);

      const result = await repository.findById(
        mockMessage.id,
        projection,
        options,
      );

      expect(result).toEqual(mockMessage);
      expect(model.findById).toHaveBeenCalledWith(
        mockMessage.id,
        projection,
        options,
      );
    });

    it('should return null when message not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
      expect(model.findById).toHaveBeenCalledWith(
        'non-existent-id',
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single message', async () => {
      const filter = { conversationId: mockMessage.conversationId };
      const projection = { content: 1 };
      const options = { sort: { timestamp: -1 } };

      jest.spyOn(model, 'findOne').mockResolvedValue(mockMessage);

      const result = await repository.findOne(filter, projection, options);

      expect(result).toEqual(mockMessage);
      expect(model.findOne).toHaveBeenCalledWith(filter, projection, options);
    });

    it('should return null when no message found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      const result = await repository.findOne({
        conversationId: 'non-existent',
      });

      expect(result).toBeNull();
      expect(model.findOne).toHaveBeenCalledWith(
        { conversationId: 'non-existent' },
        undefined,
        undefined,
      );
    });
  });

  describe('create', () => {
    it('should create a new message', async () => {
      // @ts-ignore
      jest.spyOn(model, 'create').mockResolvedValue(mockMessage);

      const result = await repository.create(mockMessage);

      expect(result).toEqual(mockMessage);
      expect(model.create).toHaveBeenCalledWith(mockMessage);
    });
  });

  describe('insertMany', () => {
    it('should insert multiple messages', async () => {
      const mockMessages = [mockMessage, { ...mockMessage, id: uuidv4() }];
      // @ts-ignore
      jest.spyOn(model, 'insertMany').mockResolvedValue(mockMessages);

      // @ts-ignore
      const result = await repository.insertMany(mockMessages);

      expect(result).toEqual(mockMessages);
      expect(model.insertMany).toHaveBeenCalledWith(mockMessages);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple messages', async () => {
      const filter = { conversationId: mockMessage.conversationId };
      const mockResult = { acknowledged: true, deletedCount: 2 };
      jest.spyOn(model, 'deleteMany').mockResolvedValue(mockResult as any);

      const result = await repository.deleteMany(filter);

      expect(result).toEqual(mockResult);
      expect(model.deleteMany).toHaveBeenCalledWith(filter);
    });
  });

  describe('aggregate', () => {
    it('should execute aggregation pipeline', async () => {
      const pipeline = [
        { $match: { conversationId: mockMessage.conversationId } },
        { $sort: { timestamp: -1 } },
      ];
      const options = { limit: 10 };
      const mockResult = [mockMessage];

      jest.spyOn(model, 'aggregate').mockResolvedValue(mockResult);

      // @ts-ignore
      const result = await repository.aggregate(pipeline, options);

      expect(result).toEqual(mockResult);
      expect(model.aggregate).toHaveBeenCalledWith(pipeline, options);
    });
  });

  describe('distinct', () => {
    it('should return distinct values for a field', async () => {
      const field = 'senderId';
      const filter = { conversationId: mockMessage.conversationId };
      const mockResult = [mockMessage.senderId];

      jest.spyOn(model, 'distinct').mockResolvedValue(mockResult);

      const result = await repository.distinct(field, filter);

      expect(result).toEqual(mockResult);
      expect(model.distinct).toHaveBeenCalledWith(field, filter);
    });
  });
});
