import { Injectable } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticsearchIndex } from './constants/elasticsearch-index';
import {
  AggregationsAggregationContainer,
  integer,
  QueryDslQueryContainer,
  SearchRequest,
  SearchSourceConfig,
  Sort,
  SortResults,
} from '@elastic/elasticsearch/lib/api/types';

type BulkUpsert = {
  index: ElasticsearchIndex;
  documents: ({ id: string } & Record<string, any>)[];
  retryOnConflict?: number;
};

type PaginatedSearch = {
  index: string;
  query: QueryDslQueryContainer;
  aggs?: Record<string, AggregationsAggregationContainer>;
  searchAfter?: SortResults;
  sort?: Sort;
  size?: integer;
  source?: SearchSourceConfig;
};

type GetPaginatedMessages = {
  query: { [index: string]: any };
  sort?: { [index: string]: any }[];
  searchAfter?: (string | number | null)[];
  source: string;
  pageSize: number;
};

@Injectable()
export class ElasticsearchService {
  constructor(
    private readonly elasticsearchService: NestElasticsearchService,
  ) {}

  async bulkUpsert({ index, documents, retryOnConflict = 0 }: BulkUpsert) {
    try {
      await this.elasticsearchService.helpers.bulk({
        datasource: documents,
        onDocument(document) {
          return [
            {
              update: {
                _index: index,
                _id: document.id,
                retry_on_conflict: retryOnConflict,
              },
            },
            { doc_as_upsert: true },
          ];
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async paginatedSearch({
    index,
    query,
    aggs,
    searchAfter,
    sort,
    size,
    source,
  }: PaginatedSearch) {
    const params: SearchRequest = {
      index,
      query,
    };

    if (searchAfter && searchAfter.length) {
      params.search_after = searchAfter;
    }

    if (sort && sort.length) {
      params.sort = sort;
    }

    if (typeof size === 'number') {
      params.size = size;
    }

    if (source) {
      params._source = source;
    }

    if (aggs) {
      params.aggs = aggs;
    }
    try {
      return this.elasticsearchService.search(params);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPaginatedMessages({
    query,
    searchAfter,
    sort,
    source,
    pageSize = 30,
  }: GetPaginatedMessages) {
    const newSort =
      sort && sort.length
        ? [
            ...sort,
            {
              id: {
                order: 'asc',
              },
            },
          ]
        : sort;

    if (newSort && newSort.length && searchAfter && searchAfter.length) {
      while (newSort.length > searchAfter.length) {
        newSort.pop();
      }
    }

    const result = await this.paginatedSearch({
      index: ElasticsearchIndex.MESSAGES,
      query,
      searchAfter,
      sort: newSort,
      size: pageSize + 1,
      source,
    });

    console.log('result', result);
  }
}
