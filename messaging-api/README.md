# Messaging API Service

REST API service for message retrieval and search functionality.

## Features

- Message retrieval with optimized pagination using compound indexes
- Full-text search across messages with Elasticsearch
- Efficient sorting by timestamp with consistent ordering
- MongoDB and Elasticsearch integration with performance optimizations

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DBNAME=''
MONGODB_USER=''
MONGODB_PASSWORD=''
MONGODB_AUTH_SOURCE=''

# Elasticsearch
ES_NODE_URI='http://localhost:9200'
ES_USER=''
ES_PASSWORD=''

# Kafka
KAFKA_CLIENT_ID='messaging-api'
KAFKA_BROKERS='localhost:9092'
```

## Database Schema

### MongoDB Schema

```typescript
interface Messages {
  id: string; // Unique message identifier
  conversationId: string; // Groups messages by conversation
  senderId: string; // Identifies message sender
  content: string; // Message content
  metadata?: Record<string, any>; // Optional metadata
  timestamp: Date; // Message creation timestamp
}
```

### Indexes

```typescript
// Primary compound index for DESC order
{ conversationId: 1, timestamp: -1, id: 1 }

// Secondary compound index for ASC order
{ conversationId: 1, timestamp: 1, id: 1 }

// User-based query index
{ senderId: 1, timestamp: -1 }
```

## API Endpoints

### Get Conversation Messages

```http
GET /api/conversations/:conversationId/messages
```

Retrieves messages for a specific conversation with optimized pagination and sorting.

#### Parameters

- `conversationId` (path): UUID of the conversation
- `lastMessageId` (query, optional): ID of the last message for pagination
- `lastPaginationId` (query, optional): Timestamp of the last message for pagination
- `sortBy` (query, optional): Sort order
  - `DATE_CREATED_ASC`: Sort by timestamp ascending
  - `DATE_CREATED_DESC`: Sort by timestamp descending (default)

#### Response

```json
{
  "messages": [
    {
      "id": "string",
      "conversationId": "string",
      "content": "string",
      "timestamp": "string",
      "senderId": "string"
    }
  ],
  "hasMore": boolean,
  "nextLastMessageId": "string",
  "nextPaginationId": "string"
}
```

### Search Conversation Messages

```http
GET /api/conversations/:conversationId/messages/search
```

Searches messages within a conversation using Elasticsearch.

#### Parameters

- `conversationId` (path): UUID of the conversation
- `q` (query): Search query string
- `lastMessageId` (query, optional): ID of the last message for pagination
- `lastPaginationId` (query, optional): Timestamp of the last message for pagination
- `sortBy` (query, optional): Sort order (same as above)

## Performance Optimizations

1. **Pagination Strategy**:

   - Uses compound indexes for efficient querying
   - Cursor-based pagination with timestamp and ID
   - Consistent ordering with ID as tie-breaker
   - Page size of 20 messages for optimal performance

2. **Query Optimization**:

   - Compound indexes cover all query patterns
   - No index intersection needed
   - Efficient range-based queries
   - Optimized sort operations

3. **Search Optimization**:
   - Elasticsearch for full-text search
   - Consistent pagination with MongoDB
   - Optimized index mapping
   - Efficient bulk operations

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start:dev

# Build for production
pnpm build

# Start production server
pnpm start:prod
```

## Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Performance Considerations

- Uses cursor-based pagination for efficient data retrieval
- Implements efficient sorting using MongoDB and Elasticsearch
- Uses Map for O(1) message lookup when maintaining order
- Implements proper indexing for search and retrieval
