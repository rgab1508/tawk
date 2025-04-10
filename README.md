# Messaging System

A scalable messaging system built with NestJS, MongoDB, Elasticsearch, and Kafka.

## Architecture Overview

The system follows a microservice architecture designed for scalability and maintainability. It consists of three main services:

### 1. Messaging API (`messaging-api`)

- Handles all REST API requests related to messaging
- Publishes messages to `create-message` topic with `conversationId` as the key
- Uses key-based partitioning to ensure message order within conversations

### 2. Messaging Storage Worker (`messaging-storage-worker`)

- Consumes messages from `create-message` topic
- Stores messages in MongoDB
- Publishes to `message-inserted` topic after successful storage
- Ensures data persistence before indexing

### 3. Messaging Search Worker (`messaging-search-worker`)

- Consumes messages from `message-inserted` topic
- Performs bulk indexing in Elasticsearch
- Optimized for search performance

## Kafka Configuration

### Topics

#### 1. `create-message`

- **Partitions**: 5 (scalable based on traffic)
- **Batch Size**: 100
- **Purpose**: Initial message creation and storage
- **Key**: `conversationId` (ensures ordered processing within conversations)

#### 2. `message-inserted`

- **Partitions**: 5 (scales linearly with `create-message`)
- **Batch Size**: 100
- **Purpose**: Elasticsearch indexing
- **Optimization**: Bulk indexing for better performance

### Producers

- `messaging-api`: Produces to `create-message`
- `messaging-storage-worker`: Produces to `message-inserted`

### Consumers

- `messaging-storage-worker`: Consumes from `create-message`
- `messaging-search-worker`: Consumes from `message-inserted`

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Elasticsearch (v8 or higher)
- Kafka (v3 or higher)
- pnpm (v8 or higher)

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd messaging-system
```

2. Install dependencies for each service:

```bash
# Install messaging-api dependencies
cd messaging-api
pnpm install

# Install messaging-storage-worker dependencies
cd ../messaging-storage-worker
pnpm install

# Install messaging-search-worker dependencies
cd ../messaging-search-worker
pnpm install
```

3. Set up environment variables for all the services:

```bash
# messaging-api/.env.local
JWT_SECRET=''
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DBNAME=''
MONGODB_USER=''
MONGODB_PASSWORD=''
MONGODB_AUTH_SOURCE=''
ES_NODE_URI='http://localhost:9200'
ES_USER=''
ES_PASSWORD=''
KAFKA_CLIENT_ID='messaging-api'
KAFKA_BROKERS='localhost:9092'

# messaging-storage-worker/.env.local
JWT_SECRET=''
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DBNAME=''
MONGODB_USER=''
MONGODB_PASSWORD=''
MONGODB_AUTH_SOURCE=''
KAFKA_CLIENT_ID='messaging-storage-worker'
KAFKA_GROUP_ID='messaging-storage-worker'
KAFKA_BROKERS='localhost:9092'


# messaging-search-worker/.env.local
JWT_SECRET=''
ES_NODE_URI='http://localhost:9200'
ES_USER=elastic
ES_PASSWORD=''
KAFKA_CLIENT_ID='messaging-search-worker'
KAFKA_GROUP_ID='messaging-search-worker'
KAFKA_BROKERS='localhost:9092'
```

Note:

- The `JWT_SECRET` is used for authentication
- Each service has its own Kafka client ID and group ID for proper message handling

4. Start the services:

```bash
# Start messaging-api
cd messaging-api
pnpm start:dev

# Start messaging-storage-worker
cd messaging-storage-worker
pnpm start:dev

# Start messaging-search-worker
cd messaging-search-worker
pnpm start:dev
```

## API Documentation

### Endpoints

### Messages

#### Create Message

Creates a new message in a conversation.

```bash
curl --location 'http://localhost:4000/api/messages' \
--header 'Content-Type: application/json' \
--data '{
    "id": "0088b8e7-936a-4752-833a-a319ab53bd78",
    "conversationId": "a12533b3-8a32-46cc-a638-da129eb92ff4",
    "senderId": "f1a50c56-5242-4581-806a-05c9ffb3039f",
    "content": "Sit vero sint.\nDolor quos unde cumque id modi ipsa.\nAutem harum rem omnis non dolorum eaque est ut."
}'
```

**Request Body:**

- `id` (string, UUID): Unique identifier for the message
- `conversationId` (string, UUID): ID of the conversation this message belongs to
- `senderId` (string, UUID): ID of the user sending the message
- `content` (string): The message content

### Conversations

#### Get Conversation Messages

Retrieves messages for a specific conversation with pagination support.

```bash
curl --location 'http://localhost:4000/api/conversations/acbfaceb-69ee-49f6-8c17-d22d431d1aa9/messages?lastMessageId=10812e3e-38e9-4bfc-85f2-fc541788e7b6&lastPaginationId=2025-03-29T13%3A51%3A25.253Z'
```

**Query Parameters:**

- `conversationId` (path parameter, UUID): ID of the conversation
- `lastMessageId` (optional, string): ID of the last message for pagination
- `lastPaginationId` (optional, string): Timestamp of the last message for pagination
- `sortBy` (optional, enum): Sort order for messages
  - `DATE_CREATED_ASC`: Sort by creation date ascending
  - `DATE_CREATED_DESC`: Sort by creation date descending (default)

#### Search Conversation Messages

Searches messages within a conversation with pagination support.

```bash
curl --location 'http://localhost:4000/api/conversations/acbfaceb-69ee-49f6-8c17-d22d431d1aa9/messages/search?q=gab&sortBy=DATE_CREATED_DESC&sortBy=DATE_CREATED_ASC&lastMessageId=36fee290-750a-4500-bd07-d5b70969b322&lastPaginationId=2025-03-30T10%3A09%3A15.756Z'
```

**Query Parameters:**

- `conversationId` (path parameter, UUID): ID of the conversation
- `q` (required, string): Search term
- `lastMessageId` (optional, string): ID of the last message for pagination
- `lastPaginationId` (optional, string): Timestamp of the last message for pagination
- `sortBy` (optional, enum): Sort order for messages
  - `DATE_CREATED_ASC`: Sort by creation date ascending
  - `DATE_CREATED_DESC`: Sort by creation date descending (default)

### Response Format

All endpoints return responses in the following format:

```json
{
  "messages": [
    {
      "id": "string",
      "conversationId": "string",
      "senderId": "string",
      "content": "string",
      "timestamp": "string",
      "metadata": {
        "type": "string",
        "timestamp": "string"
      }
    }
  ],
  "hasMore": boolean,
  "nextLastMessageId": "string",
  "nextPaginationId": "string"
}
```

### Error Responses

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input parameters or validation errors
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

Error response format:

```json
{
  "statusCode": number,
  "message": "string",
  "error": "string"
}
```

## Scaling Considerations

1. **Horizontal Scaling**

   - Each service can be scaled independently
   - Kafka partitions can be increased based on traffic
   - Multiple instances of storage and search workers can be deployed

2. **Performance Optimization**

   - Batch processing for MongoDB and Elasticsearch operations
   - Key-based partitioning for ordered message processing
   - Bulk indexing for Elasticsearch

3. **Data Consistency**
   - Messages are stored in MongoDB before indexing
   - Kafka ensures reliable message delivery
   - Partition keys maintain message order within conversations

## Monitoring and Maintenance

1. **Health Checks**

   - Each service exposes health check endpoints
   - Monitor Kafka consumer lag
   - Track MongoDB and Elasticsearch performance

2. **Logging**
   - Structured logging for all services
   - Error tracking and monitoring
   - Performance metrics collection

## Data Architecture

### MongoDB Schema Design

The messaging system uses a single collection called `Messages` with the following schema:

```typescript
interface Messages {
  id: string; // Unique message identifier
  conversationId: string; // Groups messages by conversation
  senderId: string; // Identifies message sender
  content: string; // Message content
  metadata?: Record<string, any>; // Optional metadata for extensibility
  timestamp: Date; // Message creation timestamp
}
```

#### Schema Design Choices:

1. **Indexing Strategy**:

   - **Compound Indexes**:

     ```typescript
     // Primary index for DESC timestamp order
     { conversationId: 1, timestamp: -1, id: 1 }

     // Secondary index for ASC timestamp order
     { conversationId: 1, timestamp: 1, id: 1 }
     ```

   - Benefits:
     - Perfect index coverage for pagination queries
     - Supports both ascending and descending sorts
     - Eliminates need for index intersection
     - Optimal for range-based queries on timestamp
     - Ensures consistent ordering with ID as tie-breaker

2. **Index Usage**:

   - Conversations are queried by `conversationId`
   - Range queries on `timestamp` for pagination
   - `id` as tie-breaker for same timestamps
   - No separate indexes needed for individual fields

3. **Data Consistency**:
   - Messages are first stored in MongoDB before being indexed in Elasticsearch
   - Each message has a guaranteed unique ID to prevent duplicates
   - Timestamps are server-generated for consistency

### Elasticsearch Mapping

Messages are indexed in Elasticsearch for full-text search capabilities:

- Index name: `messages`
- Indexed fields: `id`, `conversationId`, `content`, `timestamp`
- Optimized for content-based search within conversations

### Message Flow

1. **Message Creation**:

   ```
   Client -> messaging-api -> Kafka (create-message) -> messaging-storage-worker -> MongoDB
                                                    -> Kafka (message-inserted) -> messaging-search-worker -> Elasticsearch
   ```

2. **Message Retrieval**:
   - Regular queries: MongoDB (sorted by timestamp)
   - Search queries: Elasticsearch (full-text search)

### Performance Optimizations

1. **Advanced Pagination Strategy**:

   - Hybrid cursor-based pagination using both timestamp and message ID
   - Compound sorting strategy: `{ timestamp: -1, id: 1 }`
   - Prevents message skipping in high-concurrency scenarios
   - Efficient index utilization with no offset penalties
   - Page size of 20 messages for optimal response times

2. **Query Optimization**:

   - Uses compound indexes for efficient pagination queries
   - Avoids table scans with proper index coverage
   - Leverages MongoDB's index intersection
   - Cursor-based navigation eliminates deep page performance issues

3. **Elasticsearch Search Optimization**:

   - Implements `search_after` for deep pagination efficiency
   - Maintains consistency with MongoDB pagination pattern
   - Uses compound sort `[timestamp, id]` for deterministic ordering

4. **Data Consistency**:
   - Two-phase commit pattern for message storage and indexing
   - Kafka ensures reliable message delivery between services
   - Maintains message order within conversations using partition keys

### Data Security

1. **Authentication**:

   - JWT-based authentication for API access
   - Configurable MongoDB authentication
   - Elasticsearch security with username/password

2. **Data Validation**:
   - DTO-based request validation
   - Schema-level validation for MongoDB
   - Type checking for all message fields
