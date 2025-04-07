"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { api } from "~/trpc/react";
import { PrescriptionPDF } from "./prescription-pdf";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { File, Loader2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Prescription } from "~/lib/types/entities";

const PrescriptionPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: fileData,
    error: fileDetailsError,
    isLoading: isLoadingTranscription,
  } = api.transcribe.get.useQuery(
    { fileId: fileId ?? "" },
    { enabled: !!fileId },
  );

  const {
    data: patient,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = api.patientDetails.get.useQuery(
    { transcribeId: fileId! },
    { enabled: !!fileId },
  );

  if (!fileId) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-300 p-4">
        <div className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-center text-3xl font-bold text-red-500">
            Error: No file ID provided
          </h1>
        </div>
      </div>
    );
  }

  if (isLoadingTranscription || isLoadingDetails) {
    return <LoadingMessage />;
  }

  if (fileDetailsError || detailsError) {
    return <ErrorMessage />;
  }

  let prescription;
  try {
    prescription = fileData?.entities
      ? (JSON.parse(fileData.entities) as Prescription)
      : {};
  } catch (error) {
    console.error("Error parsing transcription:", error);
    prescription = null;
  }

  const summary = fileData?.summary ?? "";

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-6xl">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <File className="h-6 w-6" />
            Prescription
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
            {patient && prescription ? (
              <PDFDownloadLink
                document={
                  <PrescriptionPDF
                    patient={patient}
                    prescription={prescription}
                    summary={summary}
                  />
                }
                fileName={`prescription_${patient?.firstName || "patient"}_${new Date().toISOString().slice(0, 10)}.pdf`}
              >
                {({ loading }) => (
                  <Button className="gap-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <File className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                )}
              </PDFDownloadLink>
            ) : (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800"
            >
              <File className="h-4 w-4" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {showPreview ? (
            patient && prescription ? (
              <div className="h-[80vh] rounded-lg border">
                <PDFViewer width="100%" height="100%">
                  <PrescriptionPDF
                    patient={patient}
                    prescription={prescription}
                    summary={summary}
                  />
                </PDFViewer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
                <p className="text-lg text-red-500">Failed to load preview</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center rounded-lg border bg-gray-50 p-8">
              <div className="text-center">
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Prescription Preview
                </h3>
                <p className="mt-1 text-gray-500">
                  Click &quot;Show Preview&quot; to view the prescription
                </p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => setShowPreview(true)}
                >
                  <File className="h-4 w-4" />
                  Show Preview
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const LoadingMessage = () => {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Processing Prescription</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            We&apos;re building your prescription document...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ErrorMessage = () => {
  const router = useRouter();
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-red-600">
            <X className="h-6 w-6" />
            <span>Processing Failed</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-600">
            We encountered an error while processing your prescription.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PrescriptionPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PrescriptionPageContent />
    </Suspense>
  );
};

export default PrescriptionPage;
