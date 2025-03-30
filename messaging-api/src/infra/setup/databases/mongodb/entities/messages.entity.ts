import mongoose, { Document, Schema } from 'mongoose';

export interface Messages extends Document {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    collection: 'Messages',
  },
);

// Compound indexes for optimized pagination and sorting
MessageSchema.index(
  { conversationId: 1, timestamp: -1, id: 1 },
  { name: 'idx_conv_timestamp_desc_id' },
);

MessageSchema.index(
  { conversationId: 1, timestamp: 1, id: 1 },
  { name: 'idx_conv_timestamp_asc_id' },
);

// Index for user-based queries
MessageSchema.index(
  { senderId: 1, timestamp: -1 },
  { name: 'idx_sender_timestamp' },
);

export const MessagesModel = mongoose.model<Messages>(
  'Messages',
  MessageSchema,
);
