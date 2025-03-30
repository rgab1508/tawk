import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { CreateMessageUseCase } from '../../use-cases/v1/create-message.use-case';
import { CreateMessageBodyDto } from '../../dtos/v1/create-message.dto';
import { v4 as uuidv4 } from 'uuid';

describe('MessagesController', () => {
  let controller: MessagesController;
  let createMessageUseCase: CreateMessageUseCase;

  const mockCreateMessageUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: CreateMessageUseCase,
          useValue: mockCreateMessageUseCase,
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    createMessageUseCase =
      module.get<CreateMessageUseCase>(CreateMessageUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    const mockRequest: CreateMessageBodyDto = {
      id: uuidv4(),
      conversationId: uuidv4(),
      senderId: uuidv4(),
      content: 'Test message content',
      metadata: {
        type: 'text',
        timestamp: new Date().toISOString(),
      },
    };

    const mockResponse = {
      success: true,
      message: 'Message enqueued successfully.',
    };

    it('should successfully create a message', async () => {
      // Arrange
      mockCreateMessageUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createMessage(mockRequest);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(createMessageUseCase.execute).toHaveBeenCalledWith(mockRequest);
      expect(createMessageUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle message creation without metadata', async () => {
      // Arrange
      const requestWithoutMetadata = {
        ...mockRequest,
        metadata: undefined,
      };
      mockCreateMessageUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createMessage(requestWithoutMetadata);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(createMessageUseCase.execute).toHaveBeenCalledWith(
        requestWithoutMetadata,
      );
    });

    it('should propagate errors from the use case', async () => {
      // Arrange
      const error = new Error('Failed to create message');
      mockCreateMessageUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createMessage(mockRequest)).rejects.toThrow(
        error,
      );
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidRequest = {
        ...mockRequest,
        content: '', // Empty content should fail validation
      };

      // Act & Assert
      await expect(controller.createMessage(invalidRequest)).rejects.toThrow();
    });

    it('should validate UUID format for id and conversationId', async () => {
      // Arrange
      const invalidRequest = {
        ...mockRequest,
        id: 'invalid-uuid',
        conversationId: 'invalid-uuid',
      };

      // Act & Assert
      await expect(controller.createMessage(invalidRequest)).rejects.toThrow();
    });
  });
});
