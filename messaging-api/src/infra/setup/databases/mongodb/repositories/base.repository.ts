import {
  AggregateOptions,
  FilterQuery,
  MergeType,
  Model,
  PipelineStage,
  ProjectionType,
  Query,
  QueryOptions,
} from 'mongoose';

interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}

export class BaseMongooseRepository<T> {
  constructor(private readonly repository: Model<T>) {}

  async find(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<T[]> {
    return this.repository.find(filter, projection, options);
  }

  async findById(
    id: string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.repository.findById(id, projection, options);
  }

  async findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.repository.findOne(filter, projection, options);
  }

  async create(doc: T): Promise<T> {
    return this.repository.create(doc);
  }

  async insertMany(docs: T[]): Promise<MergeType<T, Omit<T, '_id'>>[]> {
    return this.repository.insertMany<T>(docs);
  }

  async deleteMany(filter: FilterQuery<T>): Promise<Query<DeleteResult, T>> {
    return this.repository.deleteMany(filter);
  }

  aggregate<R>(pipeline: PipelineStage[], options?: AggregateOptions) {
    return this.repository.aggregate<R>(pipeline, options);
  }

  distinct<R extends string>(field: R, filter?: FilterQuery<T>) {
    return this.repository.distinct<R>(field, filter);
  }
}
