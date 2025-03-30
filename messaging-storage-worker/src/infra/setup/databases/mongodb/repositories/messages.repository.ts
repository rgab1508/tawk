import { Injectable } from '@nestjs/common';
import { BaseMongooseRepository } from './base.repository';
import { Messages } from '../entities/messages.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MessagesRepository extends BaseMongooseRepository<Messages> {
  constructor(
    @InjectModel('Messages')
    private readonly model: Model<Messages>,
  ) {
    super(model);
  }
}
