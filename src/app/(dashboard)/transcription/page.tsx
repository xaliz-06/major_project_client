"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

const TranscriptionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");

  const [transcription, setTranscription] = useState<string>("");
  const [isLoadingTranscription, setIsLoadingTranscription] =
    useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>("");

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

  const {
    mutateAsync: getTranscription,
    isPending: isTranscribing,
    isError: isTranscribingError,
    isSuccess: isTranscribingSuccess,
  } = api.transcribe.getTranscription.useMutation();

  const { mutateAsync: updateTranscription } =
    api.transcribe.update.useMutation();

  useEffect(() => {
    if (fileDetailsError) {
      toast.error("Failed to fetch file details. Please try again.");
      setIsLoadingTranscription(false);
      return;
    }

    const fetchTranscription = async () => {
      try {
        if (!fileData?.fileURL) {
          throw new Error("File URL not found");
        }

        const result = await getTranscription({ fileURL: fileData.fileURL });

        if (result.transcription) {
          setTranscription(result.transcription);
          setEditedText(result.transcription);
          toast.success(
            result.fromCache
              ? "Transcription fetched from cache!"
              : "Transcription fetched successfully!",
          );
        }
      } catch (error) {
        toast.error("Failed to fetch transcription. Please try again.");
      } finally {
        setIsLoadingTranscription(false);
      }
    };

    if (fileData?.fileURL) {
      void fetchTranscription();
    }
  }, [fileDetailsError, fileData, getTranscription]);

  const handleSaveChanges = async () => {
    try {
      if (!fileId) {
        throw new Error("No file ID available");
      }

      await updateTranscription({
        fileId,
        transcription: editedText,
      });

      setTranscription(editedText);
      setIsEditing(false);
      toast.success("Transcription updated successfully!");
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
    }
  };

  const handleGoToNextStep = () => {
    router.push(`/entities?fileId=${fileId}`);
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
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-300 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Transcription Result
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Here&apos;s your medical transcription
        </p>

        <div className="space-y-4">
          {isLoadingTranscription ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-gray-600">
                {isLoadingFileDetails
                  ? "Loading file details..."
                  : "Transcribing the file"}
              </p>
            </div>
          ) : isTranscribingError ? (
            <p className="text-red-500">
              Failed to fetch transcription. Please try again.
            </p>
          ) : (
            <TranscriptionTextarea
              transcription={transcription}
              editedText={editedText}
              setEditedText={setEditedText}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onSave={handleSaveChanges}
              handleGoToNextStep={handleGoToNextStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

type TranscriptionProps = {
  transcription: string;
  editedText: string;
  setEditedText: (text: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => Promise<void>;
  handleGoToNextStep: () => void;
};

const TranscriptionTextarea = ({
  transcription,
  editedText,
  setEditedText,
  isEditing,
  setIsEditing,
  onSave,
  handleGoToNextStep,
}: TranscriptionProps) => {
  return (
    <>
      <Textarea
        className="h-96 w-full rounded-md border border-gray-300 p-4 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        value={isEditing ? editedText : transcription}
        readOnly={!isEditing}
        onChange={(e) => setEditedText(e.target.value)}
        placeholder="Transcription will appear here..."
      />
      <div className="flex justify-end gap-2">
        {!isEditing ? (
          <>
            <Button
              variant={"default"}
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => setIsEditing(true)}
            >
              Edit Transcription
            </Button>
            <Button
              variant={"default"}
              className="bg-green-500 hover:bg-green-600"
              onClick={handleGoToNextStep}
            >
              Generate Entities
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={"outline"}
              onClick={() => {
                setIsEditing(false);
                setEditedText(transcription);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={"default"}
              className="bg-green-500 hover:bg-green-600"
              onClick={onSave}
            >
              Save Changes
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default TranscriptionPage;
