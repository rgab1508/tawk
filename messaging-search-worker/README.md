# Messaging Search Worker

Service responsible for indexing messages in Elasticsearch for efficient full-text search.

## Features

- Kafka message consumption from `message-inserted` topic
- Elasticsearch message indexing with optimized mapping
- Batch processing for improved performance
- Full-text search capabilities

## Environment Variables

```env
# MongoDB (for health checks)
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DBNAME=tawk
MONGODB_USER=''
MONGODB_PASSWORD=''
MONGODB_AUTH_SOURCE=''

# Elasticsearch
ES_NODE_URI='http://localhost:9200'
ES_USER=''
ES_PASSWORD=''

# Kafka
KAFKA_CLIENT_ID='messaging-search-worker'
KAFKA_GROUP_ID='messaging-search-worker'
KAFKA_BROKERS='localhost:9092'
```

## Elasticsearch Mapping

### Index Configuration

```typescript
{
  index: 'messages',
  body: {
    mappings: {
      properties: {
        id: { type: 'keyword' },
        conversationId: { type: 'keyword' },
        content: { type: 'text' },
        timestamp: { type: 'date' }
      }
    }
  }
}
```

### Search Optimization

- Uses `keyword` type for exact matches on IDs
- `text` type for content with full-text search
- `date` type for timestamp-based queries
- Optimized for pagination with `search_after`

## Message Flow

1. **Message Reception**:

   - Consumes messages from `message-inserted` topic
   - Validates message format and required fields
   - Groups messages for batch processing

2. **Indexing Process**:

   - Performs bulk indexing in Elasticsearch
   - Uses optimized mapping for search performance
   - Ensures data consistency with MongoDB

3. **Search Support**:
   - Enables full-text search across messages
   - Supports pagination with cursor-based navigation
   - Maintains sort order consistency

## Performance Optimizations

1. **Batch Processing**:

   - Processes messages in configurable batch sizes
   - Uses Elasticsearch bulk API for efficient indexing
   - Reduces network round trips

2. **Search Optimization**:

   - Optimized field mappings for search performance
   - Efficient pagination using `search_after`
   - Consistent sorting with MongoDB

3. **Error Handling**:
   - Retries on transient failures
   - Dead letter queue for failed messages
   - Monitoring and alerting integration

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

## Kafka Topics

### Input Topic: message_index_create

- Messages to be indexed in Elasticsearch
- Partition key: conversationId
- Batch size: 100

## Elasticsearch Index

### Index Name: messages

- Dynamic mapping enabled
- Analyzers configured for text search
- Optimized for message content

### Mapping Structure

```json
{
  "mappings": {
    "properties": {
      "conversationId": { "type": "keyword" },
      "messageId": { "type": "keyword" },
      "content": { "type": "text" },
      "timestamp": { "type": "date" },
      "senderId": { "type": "keyword" }
    }
  }
}
```

## Performance Considerations

- Bulk indexing for Elasticsearch operations
- Efficient Kafka message handling
- Proper error handling and retries
- Connection pooling for Elasticsearch
- Kafka consumer group management

## Error Handling

The service implements the following error handling strategies:

1. Elasticsearch Errors:

   - Retries on connection failures
   - Bulk operation rollback on errors
   - Error logging for failed operations

2. Kafka Errors:
   - Consumer group rebalancing
   - Message retry mechanism
   - Dead letter queue for failed messages

## Monitoring

- Kafka consumer lag monitoring
- Elasticsearch indexing metrics
- Error rate tracking
- Processing latency monitoring
- Index health monitoring
