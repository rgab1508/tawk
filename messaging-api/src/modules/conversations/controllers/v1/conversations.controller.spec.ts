import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { GetConversationMessagesUseCase } from '../../use-cases/v1/get-conversation-messages.use-case';
import { GetConversationMessagesWithSearchUseCase } from '../../use-cases/v1/get-conversation-messages-with-search.use-case';
import { GetConversationMessagesSortBy } from '../../dtos/v1/get-conversation-messages.dto';
import { v4 as uuidv4 } from 'uuid';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('ConversationsController', () => {
  let app: INestApplication;
  let controller: ConversationsController;
  let getConversationMessagesUseCase: GetConversationMessagesUseCase;
  let getConversationMessagesWithSearchUseCase: GetConversationMessagesWithSearchUseCase;

  const mockGetConversationMessagesUseCase = {
    execute: jest.fn(),
  };

  const mockGetConversationMessagesWithSearchUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: GetConversationMessagesUseCase,
          useValue: mockGetConversationMessagesUseCase,
        },
        {
          provide: GetConversationMessagesWithSearchUseCase,
          useValue: mockGetConversationMessagesWithSearchUseCase,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    controller = module.get<ConversationsController>(ConversationsController);
    getConversationMessagesUseCase = module.get<GetConversationMessagesUseCase>(
      GetConversationMessagesUseCase,
    );
    getConversationMessagesWithSearchUseCase =
      module.get<GetConversationMessagesWithSearchUseCase>(
        GetConversationMessagesWithSearchUseCase,
      );
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('getConversationMessages', () => {
    const mockConversationId = uuidv4();
    const mockParams = { conversationId: mockConversationId };
    const mockQuery = {
      lastMessageId: uuidv4(),
      lastPaginationId: new Date().toISOString(),
      sortBy: GetConversationMessagesSortBy.DATE_CREATED_DESC,
    };

    const mockResponse = {
      messages: [
        {
          id: uuidv4(),
          conversationId: mockConversationId,
          content: 'Test message',
          timestamp: new Date().toISOString(),
        },
      ],
      hasMore: false,
    };

    it('should successfully get conversation messages', async () => {
      // Arrange
      mockGetConversationMessagesUseCase.execute.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await controller.getConversationMessages(
        mockParams,
        mockQuery,
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(getConversationMessagesUseCase.execute).toHaveBeenCalledWith({
        conversationId: mockConversationId,
        ...mockQuery,
      });
      expect(getConversationMessagesUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle optional query parameters', async () => {
      // Arrange
      const queryWithoutParams = {};
      mockGetConversationMessagesUseCase.execute.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await controller.getConversationMessages(
        mockParams,
        queryWithoutParams,
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(getConversationMessagesUseCase.execute).toHaveBeenCalledWith({
        conversationId: mockConversationId,
      });
    });

    it('should validate conversationId UUID format', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/conversations/invalid-uuid/messages')
        .query(mockQuery);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('conversationId must be a UUID');
    });

    it('should validate sortBy enum value', async () => {
      // Arrange
      const invalidQuery = {
        ...mockQuery,
        sortBy: 'INVALID_SORT',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/conversations/${mockConversationId}/messages`)
        .query(invalidQuery);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'sortBy must be one of the following values: DATE_CREATED_ASC, DATE_CREATED_DESC',
      );
    });
  });

  describe('getConversationMessagesWithSearch', () => {
    const mockConversationId = uuidv4();
    const mockParams = { conversationId: mockConversationId };
    const mockQuery = {
      q: 'search term',
      lastMessageId: uuidv4(),
      lastPaginationId: new Date().toISOString(),
      sortBy: GetConversationMessagesSortBy.DATE_CREATED_DESC,
    };

    const mockResponse = {
      messages: [
        {
          id: uuidv4(),
          conversationId: mockConversationId,
          content: 'Test message with search term',
          timestamp: new Date().toISOString(),
        },
      ],
      hasMore: false,
    };

    it('should successfully search conversation messages', async () => {
      // Arrange
      mockGetConversationMessagesWithSearchUseCase.execute.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await controller.getConversationMessagesWithSearch(
        mockParams,
        mockQuery,
      );

      const { q, ...rest } = mockQuery;

      // Assert
      expect(result).toEqual(mockResponse);
      expect(
        getConversationMessagesWithSearchUseCase.execute,
      ).toHaveBeenCalledWith({
        conversationId: mockConversationId,
        ...rest,
        searchTerm: mockQuery.q,
      });
      expect(
        getConversationMessagesWithSearchUseCase.execute,
      ).toHaveBeenCalledTimes(1);
    });

    it('should require search term', async () => {
      // Arrange
      const queryWithoutSearchTerm = {
        q: '', // Empty string to trigger validation
        lastMessageId: uuidv4(),
        lastPaginationId: new Date().toISOString(),
        sortBy: GetConversationMessagesSortBy.DATE_CREATED_DESC,
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/api/conversations/${mockConversationId}/messages/search`)
        .query(queryWithoutSearchTerm);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('q should not be empty');
    });

    it('should validate conversationId UUID format', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/api/conversations/invalid-uuid/messages/search')
        .query(mockQuery);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('conversationId must be a UUID');
    });

    it('should handle optional query parameters', async () => {
      // Arrange
      const queryWithOnlySearchTerm = { q: 'search term' };
      mockGetConversationMessagesWithSearchUseCase.execute.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await controller.getConversationMessagesWithSearch(
        mockParams,
        queryWithOnlySearchTerm,
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(
        getConversationMessagesWithSearchUseCase.execute,
      ).toHaveBeenCalledWith({
        conversationId: mockConversationId,
        searchTerm: 'search term',
      });
    });
  });
});
