import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import type { BaseNode, Document } from "@llamaindex/core/schema";
import type { ServiceContext } from "../ServiceContext.js";
import { nodeParserFromSettingsOrContext } from "../Settings.js";
import { runTransformations } from "../ingestion/IngestionPipeline.js";
import type { StorageContext } from "../storage/StorageContext.js";
import type { BaseDocumentStore } from "../storage/docStore/types.js";
import type { BaseIndexStore } from "../storage/indexStore/types.js";
import { IndexStruct } from "./IndexStruct.js";
import { IndexStructType } from "./json-to-index-struct.js";

// A table of keywords mapping keywords to text chunks.
export class KeywordTable extends IndexStruct {
  table: Map<string, Set<string>> = new Map();
  type: IndexStructType = IndexStructType.KEYWORD_TABLE;

  addNode(keywords: string[], nodeId: string): void {
    keywords.forEach((keyword) => {
      if (!this.table.has(keyword)) {
        this.table.set(keyword, new Set());
      }
      this.table.get(keyword)!.add(nodeId);
    });
  }

  deleteNode(keywords: string[], nodeId: string) {
    keywords.forEach((keyword) => {
      if (this.table.has(keyword)) {
        this.table.get(keyword)!.delete(nodeId);
      }
    });
  }

  toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      table: this.table,
      type: this.type,
    };
  }
}

export interface BaseIndexInit<T> {
  serviceContext?: ServiceContext | undefined;
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  indexStore?: BaseIndexStore | undefined;
  indexStruct: T;
}

/**
 * Indexes are the data structure that we store our nodes and embeddings in so
 * they can be retrieved for our queries.
 */
export abstract class BaseIndex<T> {
  serviceContext?: ServiceContext | undefined;
  storageContext: StorageContext;
  docStore: BaseDocumentStore;
  indexStore?: BaseIndexStore | undefined;
  indexStruct: T;

  constructor(init: BaseIndexInit<T>) {
    this.serviceContext = init.serviceContext;
    this.storageContext = init.storageContext;
    this.docStore = init.docStore;
    this.indexStore = init.indexStore;
    this.indexStruct = init.indexStruct;
  }

  /**
   * Create a new retriever from the index.
   * @param options
   */
  abstract asRetriever(options?: any): BaseRetriever;

  /**
   * Create a new query engine from the index. It will also create a retriever
   * and response synthezier if they are not provided.
   * @param options you can supply your own custom Retriever and ResponseSynthesizer
   */
  abstract asQueryEngine(options?: {
    retriever?: BaseRetriever;
    responseSynthesizer?: BaseSynthesizer;
  }): BaseQueryEngine;

  /**
   * Insert a document into the index.
   * @param document
   */
  async insert(document: Document) {
    const nodes = await runTransformations(
      [document],
      [nodeParserFromSettingsOrContext(this.serviceContext)],
    );
    await this.insertNodes(nodes);
    await this.docStore.setDocumentHash(document.id_, document.hash);
  }

  abstract insertNodes(nodes: BaseNode[]): Promise<void>;
  abstract deleteRefDoc(
    refDocId: string,
    deleteFromDocStore?: boolean,
  ): Promise<void>;
}
