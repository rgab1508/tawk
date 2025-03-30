# Messaging Storage Worker

Service responsible for storing messages in MongoDB and publishing events for Elasticsearch indexing.

## Features

- Kafka message consumption from `create-message` topic
- MongoDB message storage with optimized indexes
- Event publishing to `message-inserted` topic
- Batch processing for improved performance

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DBNAME=tawk
MONGODB_USER=''
MONGODB_PASSWORD=''
MONGODB_AUTH_SOURCE=''

# Kafka
KAFKA_CLIENT_ID='messaging-storage-worker'
KAFKA_GROUP_ID='messaging-storage-worker'
KAFKA_BROKERS='localhost:9092'

# Elasticsearch (for health checks)
ES_NODE_URI='localhost:6200'
ES_USER=''
ES_PASSWORD=''
```

## Database Schema

### MongoDB Schema

```

```
