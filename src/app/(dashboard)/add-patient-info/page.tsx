"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { File, Loader2, User } from "lucide-react";
import IdentifiedPatientForm from "./identified-patient-form";
import AnonymousPatientForm from "./anonymous-patient-form";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import type { Patient } from "~/server/db/schema";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

const AddPatientInfoPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const [activeTab, setActiveTab] = useState<"identified" | "anonymous">(
    "identified",
  );

  const { data: patient, isLoading } = api.patientDetails.get.useQuery(
    { transcribeId: fileId! },
    { enabled: !!fileId },
  );

  useEffect(() => {
    if (patient) {
      setActiveTab(patient.isAnonymous ? "anonymous" : "identified");
    }
  }, [patient]);

  const isValidGender = (
    value: string,
  ): value is "Male" | "Female" | "Other" | "Prefer not to say" =>
    ["Male", "Female", "Other", "Prefer not to say"].includes(value);

  const getPrefillData = (patient: Patient | undefined) => {
    if (!patient || patient.isAnonymous || !isValidGender(patient.gender))
      return undefined;

    return {
      ...patient,
      gender: patient.gender,
      middleName: patient.middleName ?? undefined,
      email: patient.email ?? undefined,
    };
  };

  const handleGoToNext = () => {
    if (!patient) {
      toast.error("Please save the details first!");
      return;
    }

    router.push(`/prescription?fileId=${fileId}`);
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6" />
            Add New Patient Information
          </CardTitle>
          <div className="flex items-center justify-center space-x-4">
            <Button
              className="cursor-pointer gap-2 bg-rose-500 text-white hover:bg-rose-600"
              variant={"default"}
              disabled={!patient || isLoading}
              onClick={() => router.push(`/entities?fileId=${fileId}`)}
            >
              Go Back
            </Button>
            <Button
              className="cursor-pointer gap-2 bg-green-500 text-white hover:bg-green-600"
              variant={"default"}
              disabled={!patient || isLoading}
              onClick={handleGoToNext}
            >
              <File className="h-6 w-6" />
              Generate Prescription
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex h-96 items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-lg text-gray-500">Loading...</p>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "identified" | "anonymous")
              }
              className="w-full"
            >
              <TabsList className="mx-auto my-4 grid w-11/12 max-w-md grid-cols-2 gap-4">
                <TabsTrigger
                  value="identified"
                  className={
                    activeTab === "identified"
                      ? "rounded-md bg-white px-4"
                      : "text-muted-foreground rounded-md bg-slate-300 px-4"
                  }
                >
                  Identified Patient
                </TabsTrigger>
                <TabsTrigger
                  value="anonymous"
                  className={
                    activeTab === "anonymous"
                      ? "rounded-md bg-white px-4"
                      : "text-muted-foreground rounded-md bg-slate-300 px-4"
                  }
                >
                  Anonymous Patient
                </TabsTrigger>
              </TabsList>

              <TabsContent value="identified">
                <IdentifiedPatientForm
                  fileId={fileId}
                  prefillData={getPrefillData(patient)}
                />
              </TabsContent>

              <TabsContent value="anonymous">
                <AnonymousPatientForm
                  fileId={fileId}
                  prefillData={getPrefillData(patient)}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AddPatientInfoPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AddPatientInfoPageContent />
    </Suspense>
  );
};

export default AddPatientInfoPage;
