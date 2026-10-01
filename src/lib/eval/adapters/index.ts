import type { TargetAdapter, TargetConfig } from "../types";
import { AnthropicAdapter } from "./anthropic";
import { OpenAICompatibleAdapter } from "./openai";
import { HttpAdapter } from "./http";
import { DemoAdapter } from "./demo";

export function createTargetAdapter(cfg: TargetConfig): TargetAdapter {
  switch (cfg.adapter) {
    case "anthropic": return new AnthropicAdapter(cfg);
    case "openai":
    case "openai-compatible": return new OpenAICompatibleAdapter(cfg);
    case "http": return new HttpAdapter(cfg);
    case "demo":
    default: return new DemoAdapter(cfg);
  }
}
