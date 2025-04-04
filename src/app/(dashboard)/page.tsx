"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

import { UploadDropzone } from "~/utils/uploadthing";

type File = {
  filename: string;
  fileURL: string;
  type?: string;
};

export default function HomePage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const router = useRouter();

  const { mutateAsync: addTranscription } = api.transcribe.add.useMutation();

  const handleTranscribe = async () => {
    if (!file) return;

    const fileId = await addTranscription({
      filename: file.filename,
      fileURL: file.fileURL,
      type: file.type ?? undefined,
    });

    if (!fileId) {
      setError("Failed to retrieve information. Please try again!");
      toast.error("Failed to retrieve information. Please try again!");
      return;
    }

    setFileId(fileId.fileId);
    toast.success("Got the information! Fetching transcription!");
  };

  const handleGetTranscription = () => {
    if (!fileId) return;
    router.push(`/transcription?fileId=${fileId}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-300 p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Medical Transcription
        </h1>
        <p className="text-center text-gray-600">
          Upload your medical recording for AI transcription.
        </p>

        <div className="relative">
          {!success && !error && (
            <UploadDropzone
              endpoint="audioUploader"
              className="ut-upload-icon:stroke-white ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300 bg-blue-500/60 px-2 py-2"
              config={{ cn: twMerge }}
              onClientUploadComplete={(res) => {
                // Do something with the response
                setSuccess(true);
                if (res[0]) {
                  setFile({
                    filename: res[0].name,
                    fileURL: res[0].ufsUrl,
                    type: res[0].type,
                  });
                }
                toast.success("File upload successful!");
              }}
              onUploadError={(error: Error) => {
                // Do something with the error.
                toast.error("Failed to Upload. Please try again!");
                setError(error.message);
              }}
            />
          )}

          {success && file && (
            <div className="mt-4 flex flex-col items-center justify-center space-y-2 text-center">
              <p className="text-lg font-semibold tracking-tight text-green-500">
                File Uploaded!
              </p>
              {fileId ? (
                <Button
                  variant={"default"}
                  className="flex flex-row gap-2 bg-teal-500 px-2 py-3 text-white hover:bg-teal-600"
                  onClick={handleGetTranscription}
                >
                  Go To Next
                  <ArrowRight size={"icon"} />
                </Button>
              ) : (
                <Button
                  variant={"default"}
                  className="bg-green-500 px-2 py-3 text-white hover:bg-green-600"
                  onClick={handleTranscribe}
                >
                  Transcribe
                </Button>
              )}
            </div>
          )}
          {error && (
            <div className="mt-4 flex flex-col items-center justify-center space-y-2 text-center">
              <p className="text-lg font-semibold tracking-tight text-red-500">
                There was an error! Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
