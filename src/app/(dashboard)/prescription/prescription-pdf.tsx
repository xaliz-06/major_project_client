"use client";

import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import type { GeneralPrescription, Prescription } from "~/lib/types/entities";
import type { Patient } from "~/server/db/schema";
import { styles } from "./pdf-styles";

interface PrescriptionPDFProps {
  patient: Patient;
  prescription: Prescription;
  summary: string;
}

export const PrescriptionPDF = ({
  patient,
  prescription,
  summary,
}: PrescriptionPDFProps) => {
  const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + " " : ""}${patient.lastName}`;
  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "N/A";
  const date = new Date(patient.visitDate).toLocaleDateString();
  const dob =
    patient.dateOfBirth !== "Anonymous"
      ? new Date(patient.dateOfBirth).toLocaleDateString()
      : "N/A";

  const time = patient.visitTime || "N/A";

  const generalPrescription = prescription.GeneralPrescription
    ? (JSON.parse(prescription.GeneralPrescription) as GeneralPrescription[])
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>Gotham City Hospital</Text>
            <Text style={styles.headerText}>123 Medical Center Drive</Text>
            <Text style={styles.headerText}>Gotham City, GC 10001</Text>
            <Text style={styles.headerText}>Phone: (555) 123-4567</Text>
          </View>
          <View>
            <Text style={[styles.headerText, { fontWeight: "bold" }]}>
              Prescribing Physician:
            </Text>
            <Text style={styles.headerText}>{patient.doctorName}</Text>
            <Text style={styles.headerText}>Date of visit: {date}</Text>
            <Text style={styles.headerText}>Time of visit: {time}</Text>
            <Text style={styles.headerText}>
              Patient ID: {patient.id.slice(0, 8)}
            </Text>
          </View>
        </View>

        <View style={styles.title}>
          <Text>MEDICAL PRESCRIPTION</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Patient Information</Text>
          <View style={styles.patientInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{fullName}</Text>

              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{age}</Text>

              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>{dob}</Text>

              <Text style={styles.infoLabel}>Contact:</Text>
              <Text style={styles.infoValue}>{patient.phone}</Text>

              {patient.email && (
                <>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{patient.email}</Text>
                </>
              )}
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{patient.gender}</Text>

              {prescription.Diseases?.length && (
                <>
                  <Text style={styles.infoLabel}>Diagnosis:</Text>
                  <Text style={styles.infoValue}>
                    {prescription.Diseases.join(", ")}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Symptoms */}
        {prescription.Sign_symptom?.length && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Symptoms</Text>
            {prescription.Sign_symptom.map((item, index) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* General Prescription Table */}
        {generalPrescription.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Prescribed Medications</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow}>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Medicine</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Dosage</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Frequency</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Duration</Text>
                </View>
              </View>
              {/* Table Rows */}
              {generalPrescription.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={[styles.tableCell, styles.highlight]}>
                      {item.medicine}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.dosage}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.frequency}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {item.duration ?? "As directed"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Severity */}
        {prescription.Severity?.length && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Condition Severity</Text>
            {prescription.Severity.map((item, index) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Advice */}
        {prescription.Advice?.length && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Medical Advice</Text>
            {prescription.Advice.map((item, index) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Tests */}
        {prescription.Tests?.length && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Recommended Tests</Text>
            {prescription.Tests.map((test, index) => (
              <Text key={index} style={styles.listItem}>
                • {test}
              </Text>
            ))}
          </View>
        )}

        {/* Follow Up */}
        {prescription.FollowUp?.length && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Follow Up Instructions</Text>
            {prescription.FollowUp.map((item, index) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Diagnostic Procedures */}
        {prescription.Diagnostic_procedure?.length && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Diagnostic Procedures</Text>
            {prescription.Diagnostic_procedure.map((item, index) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Clinical Summary</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.doctorInfo}>
            <Image src="/signature-placeholder.png" style={styles.signature} />
            <Text style={styles.doctorName}>{patient.doctorName}</Text>
            <Text style={styles.license}>License: MD12345</Text>
            <Text style={styles.license}>
              Date: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

function calculateAge(dob: string): string {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
}
