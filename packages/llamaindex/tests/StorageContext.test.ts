import { OpenAIEmbedding } from "@llamaindex/openai";
import {
  Settings,
  storageContextFromDefaults,
  type StorageContext,
} from "llamaindex";
import { existsSync, rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
  vi,
  vitest,
} from "vitest";
const testDir = await mkdtemp(join(tmpdir(), "test-"));
vitest.spyOn(console, "error");

describe("StorageContext", () => {
  let storageContext: StorageContext;

  beforeAll(async () => {
    Settings.embedModel = new OpenAIEmbedding();
    storageContext = await storageContextFromDefaults({
      persistDir: testDir,
    });
  });

  test("initializes", async () => {
    vi.mocked(console.error).mockImplementation(() => {}); // silence console.error

    expect(existsSync(testDir)).toBe(true);
    expect(storageContext).toBeDefined();
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true });
  });
});
