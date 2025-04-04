"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { api } from "~/trpc/react";

const EntitiesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");

  const {
    data: fileData,
    isLoading: isLoadingFileDetails,
    error: fileDetailsError,
  } = api.transcribe.get.useQuery(
    { fileId: fileId ?? "" },
    {
      enabled: !!fileId,
    },
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

  return <div>EntitiesPage {fileData?.fileURL}</div>;
};

export default EntitiesPage;
