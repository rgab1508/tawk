# tawk.to


### Setup
- Nestjs (Express)
```

```
- MongoDB
- Kafka
- ElasticSearch

### Microservice Architecture:
We are going to follow a microservice architecture which is easy to scale and manage. We are going to have multiple consumers for `messaging-consumer` & `elasticsearch-index-consumer` as messaging service start getting more traffic which would fit well with our microservice architecture. Kafka would split the topic partitions between the 2 services so we dont need to handle that.

- `messaging-api`
  - handles All the REST API requests related to messaging
  - publishes to message_created with `key` = `conversationId`
  - key is to make sure messages are pushed to same partition so they are processed in order, which is very important with messaging
    
- `messaging-consumer`
  - consumes the messages from `message_created` and insert it into the DB
  - publishes to `message_index_create`

- `elasticsearch-index-consumer`
  - consumes elastic search messages and inserts in bulk


### Kafka
**Producers**:
- `messaging-api`
  - produce for `message_created` topic, we are not creating for `message_index_create` because we want to make sure that message is inserted in DB then and only then we make sure its indexed in `ES`
- `messaging-consumer`
  - produces for `message_index_create` after messages are inserted in MongoDB

**Topics**:
- `message_created`
  - Partitions: 5 // This can be scaled up as we get more traffic
  - batchSize: 100
    - Insert in batches to reduce DB Calls
- `message_index_create`
  - Partitions: 5 // This should be linearly scaled with `message_created`'s partitions
  - batchSize: 100
    - `ES` Prefers insertion of index documents to be in `bulk`
  
**Consumers**:
- `messaging-consumer`
  - This consumer creates the record in DB
- `elasticsearch-index-consumer`
  - This consumer creates and updates the message indexes in `ES`

