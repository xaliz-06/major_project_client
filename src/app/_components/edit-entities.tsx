import React, { useState } from "react";
import type { Prescription, GeneralPrescription } from "~/lib/types/entities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";

type Props = {
  entities: Prescription;
  onSave: (generalPrescriptions: GeneralPrescription[]) => void;
};

const EditEntities = ({ entities, onSave }: Props) => {
  const allMedicines = [
    ...(entities.Medicines ?? []),
    ...(entities.Medication ?? []),
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let parsedEntities: GeneralPrescription[];

  if (entities.GeneralPrescription) {
    parsedEntities = JSON.parse(
      entities.GeneralPrescription,
    ) as GeneralPrescription[];
  } else {
    parsedEntities = allMedicines.map((medicine: string) => ({
      medicine,
      dosage: "",
      frequency: "",
      duration: "",
    }));
  }

  const [generalPrescriptions, setGeneralPrescriptions] =
    useState<GeneralPrescription[]>(parsedEntities);

  const handleDosageChange = (medicine: string, value: string) => {
    setGeneralPrescriptions((prev) =>
      prev.map((item) =>
        item.medicine === medicine ? { ...item, dosage: value } : item,
      ),
    );
  };

  const handleFrequencyChange = (medicine: string, value: string) => {
    setGeneralPrescriptions((prev) =>
      prev.map((item) =>
        item.medicine === medicine ? { ...item, frequency: value } : item,
      ),
    );
  };

  const handleDurationChange = (medicine: string, value: string) => {
    setGeneralPrescriptions((prev) =>
      prev.map((item) =>
        item.medicine === medicine ? { ...item, duration: value } : item,
      ),
    );
  };

  const handleRemoveMedicine = (medicine: string) => {
    setGeneralPrescriptions((prev) =>
      prev.filter((item) => item.medicine !== medicine),
    );
  };

  const handleAddNewMedicine = () => {
    const newMedicine = `New Medicine ${generalPrescriptions.length + 1}`;
    setGeneralPrescriptions((prev) => [
      ...prev,
      {
        medicine: newMedicine,
        dosage: "",
        frequency: "",
        duration: "",
      },
    ]);
  };

  const handleSave = () => {
    const isValid = generalPrescriptions.every(
      (item) => item.dosage && item.duration,
    );

    if (!isValid) {
      toast.error(
        "Please ensure each medicine has dosage and duration selected",
      );
      return;
    }

    onSave(generalPrescriptions);
    toast.success("Prescription saved successfully!");
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Medicine</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {generalPrescriptions.map((prescription) => (
              <TableRow key={prescription.medicine}>
                <TableCell className="font-medium">
                  {prescription.medicine}
                </TableCell>
                <TableCell>
                  <Select
                    value={prescription.dosage}
                    onValueChange={(value) =>
                      handleDosageChange(prescription.medicine, value)
                    }
                    disabled={!entities.Dosage?.length}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={
                          entities.Dosage?.length
                            ? "Select dosage"
                            : "No dosages available"
                        }
                      />
                    </SelectTrigger>
                    {entities.Dosage?.length ? (
                      <SelectContent>
                        {entities.Dosage.map((dosage) => (
                          <SelectItem key={dosage} value={dosage}>
                            {dosage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    ) : null}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={prescription.frequency}
                    onValueChange={(value) =>
                      handleFrequencyChange(prescription.medicine, value)
                    }
                    disabled={!entities.Frequency?.length}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={
                          entities.Frequency?.length
                            ? "Select frequency"
                            : "No frequencies available"
                        }
                      />
                    </SelectTrigger>
                    {entities.Frequency?.length ? (
                      <SelectContent>
                        {entities.Frequency.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    ) : null}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={prescription.duration}
                    onValueChange={(value) =>
                      handleDurationChange(prescription.medicine, value)
                    }
                    disabled={!entities.Duration?.length}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={
                          entities.Duration?.length
                            ? "Select duration"
                            : "No durations available"
                        }
                      />
                    </SelectTrigger>
                    {entities.Duration?.length ? (
                      <SelectContent>
                        {entities.Duration.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    ) : null}
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMedicine(prescription.medicine)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 hover:bg-slate-200"
          onClick={handleAddNewMedicine}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Medicine
        </Button>

        <Button
          onClick={handleSave}
          variant="default"
          size="sm"
          className="gap-1 bg-green-500 text-white hover:bg-green-600"
          disabled={!generalPrescriptions.length}
        >
          <Check className="h-3.5 w-3.5" />
          Save Prescription
        </Button>
      </div>
    </div>
  );
};

export default EditEntities;
