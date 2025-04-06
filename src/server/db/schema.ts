import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { cuid2 } from "drizzle-cuid2/sqlite";
import { relations, sql } from "drizzle-orm";

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

export const patients = sqliteTable(
  "patients_table",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    transcribeId: text("transcribe_id")
      .notNull()
      .references(() => transcribes.id),
    isAnonymous: integer("is_anonymous", { mode: "boolean" })
      .notNull()
      .default(false),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    dateOfBirth: text("date_of_birth").notNull(), // Storing as ISO string
    gender: text("gender").notNull(), // One of "Male", "Female", "Other", "Prefer not to say"
    phone: text("phone").notNull(),
    email: text("email"),
    visitDate: text("visit_date").notNull(), // Storing as ISO string
    visitTime: text("visit_time").notNull(),
    doctorName: text("doctor_name").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`),
  },
  (table) => [
    index("patient_transcribe_idx").on(table.transcribeId),
    index("patient_doctor_idx").on(table.doctorName),
  ],
);

export const patientsRelations = relations(patients, ({ one }) => ({
  transcribe: one(transcribes, {
    fields: [patients.transcribeId],
    references: [transcribes.id],
  }),
}));

export const transcribesRelations = relations(transcribes, ({ many }) => ({
  patients: many(patients),
}));

export type Patient = typeof patients.$inferSelect;
