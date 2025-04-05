import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { cuid2 } from "drizzle-cuid2/sqlite";
import { sql } from "drizzle-orm";

export const transcribes = sqliteTable(
  "transcribe_table",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    filename: text().notNull(),
    fileURL: text().notNull().unique(),
    type: text(),
    transcription: text("transcription"),
    entities: text("entities"),
    summary: text("summary"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`),
  },
  (table) => [
    index("filename_idx").on(table.filename),
    uniqueIndex("fileURL_idx").on(table.fileURL),
  ],
);
