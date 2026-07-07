import type { Target } from "./translate-core";
import { translateTextCore } from "./translate-core";

export async function translateTextServer(
  text: string,
  target: Target,
): Promise<string> {
  return translateTextCore(text, target);
}
