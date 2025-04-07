import { z } from "zod";

const prescriptionSchema = z
  .object({
    Medicines: z.array(z.string()).optional(),
    Medication: z.array(z.string()).optional(),
    Dosage: z.array(z.string()).optional(),
    Frequency: z.array(z.string()).optional(),
    Duration: z.array(z.string()).optional(),
    Advice: z.array(z.string()).optional(),
    Tests: z.array(z.string()).optional(),
    FollowUp: z.array(z.string()).optional(),
    Diseases: z.array(z.string()).optional(),
    Age: z.array(z.string()).optional(),
    Sex: z.array(z.string()).optional(),
    Severity: z.array(z.string()).optional(),
    Sign_symptom: z.array(z.string()).optional(),
    Diagnostic_procedure: z.array(z.string()).optional(),
    Biological_structure: z.array(z.string()).optional(),
    GeneralPrescription: z.string().optional(),
  })
  .passthrough();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const predictionResponseSchema = z.object({
  summary: z.string(),
  prescription: prescriptionSchema,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generalPrescriptionSchema = z.object({
  medicine: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string().optional(),
});

export type Prescription = z.infer<typeof prescriptionSchema>;
export type PredictionResponse = z.infer<typeof predictionResponseSchema>;
export type GeneralPrescription = z.infer<typeof generalPrescriptionSchema>;
