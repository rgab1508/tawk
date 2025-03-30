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
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
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
      index: true,
    },
  },
  {
    collection: 'Messages',
  },
);

export const MessagesModel = mongoose.model<Messages>(
  'Messages',
  MessageSchema,
);
