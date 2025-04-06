"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, subYears, differenceInYears } from "date-fns";
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
import {
  CalendarIcon,
  User,
  Phone,
  Mail,
  Stethoscope,
  Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import {
  genderEnum,
  type CreatePatientInput,
  type PrefillData,
} from "~/lib/types/patient";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  age: z.number().optional(),
  gender: genderEnum,
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional(),
  visitDate: z.date(),
  visitTime: z.string(),
  doctorName: z.string().min(1, "Doctor name is required"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  fileId: string;
  prefillData?: PrefillData;
};

const IdentifiedPatientForm = ({ fileId, prefillData }: Props) => {
  const defaultValues = prefillData
    ? {
        ...prefillData,
        dateOfBirth: new Date(prefillData.dateOfBirth),
        visitDate: new Date(prefillData.visitDate),
        visitTime: prefillData.visitTime,
      }
    : {
        firstName: "",
        middleName: "",
        lastName: "",
        phone: "",
        email: "",
        doctorName: "",
        visitDate: new Date(),
        visitTime: format(new Date(), "HH:mm"),
      };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const {
    mutateAsync: addPatientDetails,
    isError,
    isPending,
  } = api.patientDetails.add.useMutation();

  const dob = form.watch("dateOfBirth");

  // Calculate age when date of birth changes
  React.useEffect(() => {
    if (dob) {
      const age = differenceInYears(new Date(), dob);
      form.setValue("age", age);
    }
  }, [dob, form]);

  const onSubmit = async (values: FormValues) => {
    if (!fileId) return;

    const formattedValues: CreatePatientInput = {
      ...values,
      dateOfBirth: values.dateOfBirth.toISOString(),
      visitDate: values.visitDate.toISOString(),
      isAnonymous: false,
      transcribeId: fileId,
    };

    try {
      const result = await addPatientDetails({
        ...formattedValues,
      });

      if (isError) {
        toast.error("Error saving patient details");
      }

      if (result.action === "updated") {
        toast.success("Patient details updated successfully");
      }

      if (result.action === "created") {
        toast.success("Patient details saved successfully");
      }
    } catch (error) {
      toast.error("Error saving patient details");
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
    toast.info("Form has been reset");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>First Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="First name"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Middle name"
                      {...field}
                      className="bg-white"
                    />
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
                  <FormLabel>Last Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Last name"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Date of Birth*</FormLabel>
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
                        captionLayout="dropdown-buttons"
                        fromYear={1920}
                        toYear={new Date().getFullYear()}
                        disabled={(date) =>
                          date > new Date() || date < subYears(new Date(), 120)
                        }
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
              name="age"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Age"
                      readOnly
                      value={field.value ? `${field.value} years` : ""}
                      className="bg-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Gender*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Contact Information Section */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Phone className="h-5 w-5" />
            Contact Information
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Phone Number*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone number"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            className="cursor-pointer gap-2 bg-rose-500 text-white hover:bg-rose-600"
            onClick={handleReset}
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

export default IdentifiedPatientForm;
