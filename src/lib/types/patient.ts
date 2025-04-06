import { z } from "zod";

export const genderEnum = z.enum([
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
]);

type Gender = typeof genderEnum._type;

export type PrefillData = {
  transcribeId: string;
  isAnonymous: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  visitDate: string;
  visitTime: string;
  doctorName: string;
  middleName?: string;
  email?: string;
  age?: number;
};

export const createPatientSchema = z.object({
  transcribeId: z.string().min(1, "Transcribe ID is required"),
  isAnonymous: z.boolean().default(false),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"), // ISO string format
  age: z.number().int().positive().optional(),
  gender: genderEnum,
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional(),
  visitDate: z.string().min(1, "Visit date is required"), // ISO string format
  visitTime: z.string().min(1, "Visit time is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
