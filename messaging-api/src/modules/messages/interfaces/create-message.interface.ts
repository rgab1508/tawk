export type CreateMessageRequestV1 = {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  metadata?: Record<string, unknown>;
};

export type CreateMessageResponseV1 = {
  success: boolean;
  message: string;
};
