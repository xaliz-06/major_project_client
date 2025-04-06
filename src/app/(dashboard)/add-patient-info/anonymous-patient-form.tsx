"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CalendarIcon, Loader2, Stethoscope } from "lucide-react";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import {
  createPatientSchema,
  genderEnum,
  type CreatePatientInput,
  type PrefillData,
} from "~/lib/types/patient";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  visitDate: z.date(),
  visitTime: z.string(),
  doctorName: z.string().min(1, "Doctor name is required"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  fileId: string;
  prefillData?: PrefillData;
};

const AnonymousPatientForm = ({ fileId, prefillData }: Props) => {
  const defaultValues: FormValues = prefillData
    ? {
        firstName: "Anonymous",
        lastName: "Patient",
        phone: "0000000000",
        dateOfBirth: "Anonymous",
        doctorName: prefillData.doctorName,
        visitDate: new Date(prefillData.visitDate),
        visitTime: prefillData.visitTime,
      }
    : {
        firstName: "Anonymous",
        lastName: "Patient",
        phone: "0000000000",
        dateOfBirth: "Anonymous",
        doctorName: "",
        visitDate: new Date(),
        visitTime: format(new Date(), "HH:mm"),
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { mutateAsync: addPatientDetails, isPending } =
    api.patientDetails.add.useMutation({
      onSuccess: (result) => {
        if (result.action === "updated") {
          toast.success("Patient details updated successfully");
        } else {
          toast.success("Patient details saved successfully");
        }
      },
      onError: () => {
        toast.error("Error saving patient details");
      },
    });

  const onSubmit = async (values: FormValues) => {
    if (!fileId) return;

    const rawPayload = {
      ...values,
      visitDate: values.visitDate.toISOString(),
      transcribeId: fileId,
      middleName: "",
      email: "anonymous@doe.com",
      gender: genderEnum.parse("Prefer not to say"),
      isAnonymous: true,
    };

    const resultPayload = createPatientSchema.safeParse(rawPayload);
    if (!resultPayload.success) {
      console.error("Validation failed", resultPayload.error.flatten());
      toast.error("Validation failed while preparing payload");
      return;
    }

    const formattedValues = resultPayload.data;

    try {
      await addPatientDetails(formattedValues);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
    toast.info("Form has been reset");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="text-muted-foreground text-sm">
            Anonymous patient records will use placeholder information for
            personal details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-100" disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-100" disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-6" />

        {/* Visit Information Section */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarIcon className="h-5 w-5" />
            Visit Information
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="visitDate"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Visit Date*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visitTime"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Visit Time*</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorName"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Doctor/Practitioner*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Stethoscope className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Doctor name"
                        {...field}
                        className="bg-white pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="default"
            onClick={handleReset}
            className="cursor-pointer gap-2 bg-rose-500 text-white hover:bg-rose-600"
            disabled={isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="cursor-pointer gap-2 bg-green-500 text-white hover:bg-green-600"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AnonymousPatientForm;
