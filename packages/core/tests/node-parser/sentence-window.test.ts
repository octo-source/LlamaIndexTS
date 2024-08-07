import { SentenceWindowNodeParser } from "@llamaindex/core/node-parser";
import { Document, MetadataMode } from "@llamaindex/core/schema";
import { describe, expect, test } from "vitest";

describe("Tests for the SentenceWindowNodeParser class", () => {
  test("testing the constructor", () => {
    const sentenceWindowNodeParser = new SentenceWindowNodeParser();
    expect(sentenceWindowNodeParser).toBeDefined();
  });
  test("testing the getNodesFromDocuments method", () => {
    const sentenceWindowNodeParser = new SentenceWindowNodeParser({
      windowSize: 1,
    });
    const doc = new Document({ text: "Hello. Cat Mouse. Dog." });
    const resultingNodes = sentenceWindowNodeParser.getNodesFromDocuments([
      doc,
    ]);
    expect(resultingNodes.length).toEqual(3);
    expect(resultingNodes.map((n) => n.getContent(MetadataMode.NONE))).toEqual([
      "Hello.",
      "Cat Mouse.",
      "Dog.",
    ]);
    expect(
      resultingNodes.map(
        (n) => n.metadata[SentenceWindowNodeParser.DEFAULT_WINDOW_METADATA_KEY],
      ),
    ).toEqual([
      "Hello. Cat Mouse.",
      "Hello. Cat Mouse. Dog.",
      "Cat Mouse. Dog.",
    ]);
  });
});
