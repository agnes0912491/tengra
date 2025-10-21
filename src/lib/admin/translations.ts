import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

type TranslationFileInfo = {
  locale: string;
  fileName: string;
  absolutePath: string;
  bytes: number;
  characters: number;
  keys: number;
};

const TRANSLATIONS_DIR = path.join(process.cwd(), "src", "i18n", "messages");

const safeParse = (content: string) => {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return parsed;
  } catch (error) {
    console.error("Failed to parse translation file", error);
    return {};
  }
};

export const listTranslationFiles = async (): Promise<TranslationFileInfo[]> => {
  const entries = await fs.readdir(TRANSLATIONS_DIR);

  const files = await Promise.all(
    entries
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const absolutePath = path.join(TRANSLATIONS_DIR, file);
        const stats = await fs.stat(absolutePath);

        if (!stats.isFile()) {
          return null;
        }

        const content = await fs.readFile(absolutePath, "utf8");
        const parsed = safeParse(content);

        return {
          locale: path.basename(file, ".json"),
          fileName: file,
          absolutePath,
          bytes: stats.size,
          characters: content.length,
          keys: Object.keys(parsed).length,
        } satisfies TranslationFileInfo;
      })
  );

  return files
    .filter((info): info is TranslationFileInfo => Boolean(info))
    .sort((a, b) => a.locale.localeCompare(b.locale));
};

export type { TranslationFileInfo };
