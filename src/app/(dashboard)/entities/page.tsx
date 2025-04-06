"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type { GeneralPrescription, Prescription } from "~/lib/types/entities";
import { api } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  X,
  Plus,
  Pencil,
  Loader2,
  Save,
  ArrowBigRight,
  FileEdit,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import EditEntities from "~/app/_components/edit-entities";

const EntitiesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");

  const [isGeneratingEntities, setIsGeneratingEntities] =
    useState<boolean>(true);
  const [summary, setSummary] = useState<string>("");
  const [prescription, setPrescription] = useState<Prescription>();

  const [editingValue, setEditingValue] = useState<string>("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [newValue, setNewValue] = useState<string>("");

  const [addingField, setAddingField] = useState<string | null>(null);

  const [deletingItem, setDeletingItem] = useState<{
    field: string;
    index: number;
  } | null>(null);

  const [isEditEntitiesOpen, setIsEditEntitiesOpen] = useState<boolean>(false);

  const { data: fileData, error: fileDetailsError } =
    api.transcribe.get.useQuery(
      { fileId: fileId ?? "" },
      {
        enabled: !!fileId,
      },
    );

  const { mutateAsync: generateEntities, isError: isGeneratingError } =
    api.entities.generate.useMutation();

  const {
    mutateAsync: saveEntities,
    isError: isSavingError,
    isPending: isSaving,
  } = api.entities.save.useMutation();

  useEffect(() => {
    if (fileDetailsError) {
      toast.error("Failed to fetch file details. Please try again.");
      setIsGeneratingEntities(false);
      return;
    }

    const fetchEntities = async () => {
      try {
        if (!fileData?.transcription) {
          throw new Error("File transcription not found");
        }

        const result = await generateEntities({
          transcription: fileData.transcription,
          fileId: fileData.id,
        });

        if (isGeneratingError) {
          toast.error("Failed to generate entities. Please try again!");
        }

        if (result) {
          setSummary(result.summary);
          setPrescription(result.prescription);
          toast.success("Entities generated!");
        }
      } catch (error) {
        toast.error("Failed to generate entities. Please try again.");
      } finally {
        setIsGeneratingEntities(false);
      }
    };

    if (fileData?.transcription) {
      void fetchEntities();
    }
  }, [fileDetailsError, fileData, generateEntities, isGeneratingError]);

  const handleEdit = (field: string, index: number, value: string) => {
    console.log(field, index, value);
    setEditingField(field);
    setEditingIndex(index);
    setEditingValue(value);
  };

  const handleSaveEdit = () => {
    if (editingField && editingIndex !== null && prescription) {
      const updatedPrescription = { ...prescription };
      if (updatedPrescription[editingField]) {
        updatedPrescription[editingField][editingIndex] = editingValue;
        setPrescription(updatedPrescription);
      }
      setEditingField(null);
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const handleAddValue = (field: string) => {
    if (newValue.trim() && prescription) {
      const updatedPrescription = { ...prescription };
      updatedPrescription[field] ??= [];
      updatedPrescription[field].push(newValue);
      setPrescription(updatedPrescription);
      setNewValue("");
      setAddingField(null);
    }
  };

  const handleDelete = () => {
    if (deletingItem && prescription) {
      const { field, index } = deletingItem;
      const updatedPrescription = { ...prescription };
      if (updatedPrescription[field]) {
        updatedPrescription[field].splice(index, 1);
        setPrescription(updatedPrescription);
      }
      setDeletingItem(null);
    }
  };

  const handleSaveToDb = async () => {
    if (!prescription || !fileId) return;

    try {
      const result = await saveEntities({
        fileId,
        entities: JSON.stringify(prescription),
        summary,
      });

      if (isSavingError) {
        toast.error("Failed to save entities. Please try again!");
      }

      if (result?.summary && result?.entities) {
        setSummary(result.summary);
        setPrescription(JSON.parse(result.entities) as Prescription);
        toast.success("Prescription saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save prescription");
      console.error(error);
    }
  };

  const handleSaveEditEntities = async (
    updatedPrescription: GeneralPrescription[],
  ) => {
    if (!prescription || !fileId) return;
    const updatedPrescriptionObj: Prescription = {
      ...prescription,
      GeneralPrescription: JSON.stringify(updatedPrescription),
    };

    try {
      const result = await saveEntities({
        fileId,
        entities: JSON.stringify(updatedPrescriptionObj),
        summary,
      });

      if (isSavingError) {
        toast.error("Failed to save entities. Please try again!");
      }

      if (result?.summary && result?.entities) {
        setSummary(result.summary);
        setPrescription(JSON.parse(result.entities) as Prescription);
        toast.success("Prescription saved successfully!");
        setIsEditEntitiesOpen(false);
      }
    } catch (error) {
      toast.error("Failed to save prescription");
      console.error(error);
    }
  };

  const handleGoToNext = async () => {
    if (!prescription || !fileId) return;

    await handleSaveToDb();
    router.push(`/add-patient-info?fileId=${fileId}`);
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

  if (isGeneratingEntities) {
    return <LoadingMessage />;
  }

  if (isGeneratingError) {
    return <ErrorMessage />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mx-6 my-4 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center rounded-lg bg-gray-300 p-4">
        <div className="mb-8 w-full rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Original Transcription</h2>
          <Textarea
            readOnly
            value={fileData?.transcription ?? "No transcription available"}
            className="min-h-[150px] w-full font-mono text-sm"
            placeholder="Transcription will appear here..."
          />
        </div>
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Summary</h2>
          <p className="text-gray-700">{summary}</p>
        </div>

        <div className="w-full rounded-lg bg-white p-6 shadow-md">
          <div className="flex w-full flex-row justify-between">
            <h2 className="mb-4 text-xl font-semibold">
              Prescription Entities
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveToDb}
                variant="default"
                className="gap-2 bg-green-500 text-white hover:bg-green-600"
                disabled={!prescription || isSaving || isEditEntitiesOpen}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Entities
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsEditEntitiesOpen((prev) => !prev)}
                variant="default"
                className="gap-2 bg-blue-500 text-white hover:bg-blue-600"
                disabled={!prescription || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <FileEdit className="h-4 w-4" />
                    Go to Edit
                  </>
                )}
              </Button>
              <Button
                onClick={handleGoToNext}
                variant="default"
                className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800"
                disabled={!prescription || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ArrowBigRight className="h-4 w-4" />
                    Save and Add Patient Info
                  </>
                )}
              </Button>
            </div>
          </div>
          {prescription && isEditEntitiesOpen && (
            <EditEntities
              entities={prescription}
              onSave={handleSaveEditEntities}
            />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 font-semibold">Field</TableHead>
                <TableHead className="w-2/3 font-semibold">Values</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescription &&
                Object.entries(prescription)
                  .filter(([field]) => field !== "GeneralPrescription")
                  .map(([field, values]) => (
                    <TableRow key={field}>
                      <TableCell className="font-medium capitalize">
                        {field.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(values) &&
                            values.map((value, index) => (
                              <div
                                key={`${field}-${index}`}
                                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
                              >
                                <span className="mr-1 font-semibold">
                                  {value}
                                </span>
                                <button
                                  onClick={() =>
                                    handleEdit(field, index, value)
                                  }
                                  className="cursor-pointer text-blue-500 hover:text-blue-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeletingItem({ field, index })
                                  }
                                  className="cursor-pointer text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}

                          <Popover
                            open={addingField === field}
                            onOpenChange={(open) =>
                              open
                                ? setAddingField(field)
                                : setAddingField(null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <h4 className="leading-none font-medium">
                                    Add Value
                                  </h4>
                                  <p className="text-muted-foreground text-sm">
                                    Add a new value for {field}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    value={newValue}
                                    onChange={(e) =>
                                      setNewValue(e.target.value)
                                    }
                                    placeholder="Enter value"
                                  />
                                  <Button
                                    onClick={() => handleAddValue(field)}
                                    disabled={!newValue.trim()}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        <Dialog
          open={!!editingField && editingIndex !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingField(null);
              setEditingIndex(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Value</DialogTitle>
              <DialogDescription>
                Edit value for {editingField?.replace(/_/g, " ")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 py-4">
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={!!deletingItem}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingItem(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                value.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

const LoadingMessage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Processing File
        </h1>
        <p className="mt-2 text-gray-600">
          We&apos;re analyzing your prescription and extracting entities. This
          may take a moment...
        </p>
        <div className="mt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const ErrorMessage = () => {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <X className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Processing Failed
        </h1>
        <p className="mt-2 text-gray-600">
          We encountered an error while generating entities. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={() => window.location.reload()} variant="default">
            Try Again
          </Button>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EntitiesPage;
