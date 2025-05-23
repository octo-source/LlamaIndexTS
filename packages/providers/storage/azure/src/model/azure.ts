import { getEnv, process } from "@llamaindex/env";
import type { LLMInstance } from "@llamaindex/openai";
import type FinalRequestOptions from "openai";
import { AzureOpenAI, type AzureClientOptions } from "openai";
import pkg from "../../package.json";

// NOTE we're not supporting the legacy models as they're not available for new deployments
// https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/legacy-models
// If you have a need for them, please open an issue on GitHub

const ALL_AZURE_OPENAI_CHAT_MODELS = {
  "gpt-35-turbo": { contextWindow: 4096, openAIModel: "gpt-3.5-turbo" },
  "gpt-35-turbo-16k": {
    contextWindow: 16384,
    openAIModel: "gpt-3.5-turbo-16k",
  },
  "gpt-4o": { contextWindow: 128000, openAIModel: "gpt-4o" },
  "gpt-4o-mini": { contextWindow: 128000, openAIModel: "gpt-4o-mini" },
  "gpt-4": { contextWindow: 8192, openAIModel: "gpt-4" },
  "gpt-4-32k": { contextWindow: 32768, openAIModel: "gpt-4-32k" },
  "gpt-4-turbo": {
    contextWindow: 128000,
    openAIModel: "gpt-4-turbo",
  },
  "gpt-4-turbo-2024-04-09": {
    contextWindow: 128000,
    openAIModel: "gpt-4-turbo",
  },
  "gpt-4-vision-preview": {
    contextWindow: 128000,
    openAIModel: "gpt-4-vision-preview",
  },
  "gpt-4-1106-preview": {
    contextWindow: 128000,
    openAIModel: "gpt-4-1106-preview",
  },
  "gpt-4o-2024-05-13": {
    contextWindow: 128000,
    openAIModel: "gpt-4o-2024-05-13",
  },
  "gpt-4o-mini-2024-07-18": {
    contextWindow: 128000,
    openAIModel: "gpt-4o-mini-2024-07-18",
  },
};

const ALL_AZURE_OPENAI_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    dimensions: 1536,
    openAIModel: "text-embedding-ada-002",
    maxTokens: 8191,
  },
  "text-embedding-3-small": {
    dimensions: 1536,
    dimensionOptions: [512, 1536],
    openAIModel: "text-embedding-3-small",
    maxTokens: 8191,
  },
  "text-embedding-3-large": {
    dimensions: 3072,
    dimensionOptions: [256, 1024, 3072],
    openAIModel: "text-embedding-3-large",
    maxTokens: 8191,
  },
};

// Current version list found here - https://learn.microsoft.com/en-us/azure/ai-services/openai/reference
// const ALL_AZURE_API_VERSIONS = [
//   "2022-12-01",
//   "2023-05-15",
//   "2023-06-01-preview", // Maintained for DALL-E 2
//   "2023-10-01-preview",
//   "2024-02-01",
//   "2024-02-15-preview",
//   "2024-03-01-preview",
//   "2024-04-01-preview",
//   "2024-05-01-preview",
//   "2024-06-01",
// ];

const DEFAULT_API_VERSION = "2023-05-15";
//^ NOTE: this will change over time, if you want to pin it, use a specific version

export function getAzureConfigFromEnv(
  init?: Partial<AzureClientOptions> & { model?: string },
): AzureClientOptions {
  const deployment =
    init && "deploymentName" in init && typeof init.deploymentName === "string"
      ? init?.deploymentName
      : (init?.deployment ??
        getEnv("AZURE_OPENAI_DEPLOYMENT") ?? // From Azure docs
        getEnv("AZURE_OPENAI_API_DEPLOYMENT_NAME") ?? // LCJS compatible
        init?.model); // Fall back to model name, Python compatible
  return {
    apiKey:
      init?.apiKey ??
      getEnv("AZURE_OPENAI_KEY") ?? // From Azure docs
      getEnv("OPENAI_API_KEY") ?? // Python compatible
      getEnv("AZURE_OPENAI_API_KEY"), // LCJS compatible
    endpoint:
      init?.endpoint ??
      getEnv("AZURE_OPENAI_ENDPOINT") ?? // From Azure docs
      getEnv("OPENAI_API_BASE") ?? // Python compatible
      getEnv("AZURE_OPENAI_API_INSTANCE_NAME"), // LCJS compatible
    apiVersion:
      init?.apiVersion ??
      getEnv("AZURE_OPENAI_API_VERSION") ?? // From Azure docs
      getEnv("OPENAI_API_VERSION") ?? // Python compatible
      getEnv("AZURE_OPENAI_API_VERSION") ?? // LCJS compatible
      DEFAULT_API_VERSION,
    deployment, // For Azure OpenAI
  };
}

export function getAzureModel(openAIModel: string) {
  for (const [key, value] of Object.entries(
    ALL_AZURE_OPENAI_EMBEDDING_MODELS,
  )) {
    if (value.openAIModel === openAIModel) {
      return key;
    }
  }

  for (const [key, value] of Object.entries(ALL_AZURE_OPENAI_CHAT_MODELS)) {
    if (value.openAIModel === openAIModel) {
      return key;
    }
  }

  throw new Error(`Unknown model: ${openAIModel}`);
}

export function shouldUseAzure() {
  return (
    getEnv("AZURE_OPENAI_ENDPOINT") ||
    getEnv("AZURE_OPENAI_API_INSTANCE_NAME") ||
    getEnv("OPENAI_API_TYPE") === "azure"
  );
}

// TS issue: https://github.com/microsoft/TypeScript/issues/37142
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: any[]) => any;

// This mixin adds a User-Agent header to the request for Azure OpenAI
export function AzureOpenAIWithUserAgent<K extends Constructor>(Base: K) {
  return class AzureOpenAI extends Base {
    // Define a new public method that wraps the base class's defaultHeaders
    defaultHeaders(opts: FinalRequestOptions) {
      const baseHeaders = super.defaultHeaders(opts);
      return {
        ...baseHeaders,
        "User-Agent": `${pkg.name}/${pkg.version} (node.js/${process.version}; ${process.platform}; ${process.arch}) ${baseHeaders["User-Agent"] || ""}`,
      };
    }
  };
}

export type AzureInitSession = AzureClientOptions & {
  session?: AzureOpenAI;
};

export const lazySession = (init?: AzureInitSession) => {
  return async () => {
    if (init?.session) {
      return init?.session as unknown as LLMInstance;
    }
    const AzureOpenAILib = AzureOpenAIWithUserAgent(AzureOpenAI);

    return new AzureOpenAILib({
      // Use base class properties for retries, timeout, etc.
      maxRetries: init?.maxRetries ?? 10,
      timeout: init?.timeout ?? 60 * 1000,
      // Apply Azure specific config
      ...getAzureConfigFromEnv(),
      ...init,
    }) as unknown as LLMInstance;
  };
};
