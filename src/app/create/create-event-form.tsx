"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  AlertCircleIcon,
  ArrowUpRight,
  ClockIcon,
  ImageIcon,
  Loader2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useId, useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";
import { usePinataUpload } from "@/hooks/use-pinata-upload";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EventMetadata {
  description: string;
  dateTime: string;
  locationAddress: string;
  category: string;
  image: string;
  contact: string;
  secondaryMarketFee: number;
}

export interface EventCreatePayload {
  metadata: EventMetadata;
  name: string;
  creatorAddress: string;
  maxSupply: number;
  primaryPrice: number;
  createFeeBps: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CATEGORIES = [
  "Music",
  "Conference",
  "Sports",
  "Art",
  "Theater",
  "Festival",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// ============================================================================
// ZOD SCHEMA
// ============================================================================

const eventFormSchema = z.object({
  // Event name
  name: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name cannot exceed 100 characters"),

  // Event description
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  // Date (separate for form, combined later)
  date: z.date({ message: "Event date is required" }),

  // Time (HH:mm format)
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),

  // Location
  locationAddress: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(200, "Location cannot exceed 200 characters"),

  // Category
  category: z.enum(CATEGORIES, {
    message: "Please select a category",
  }),

  // Image URL or CID
  image: z.string().min(1, "Event image is required"),

  // Contact info
  contact: z
    .string()
    .min(5, "Contact info must be at least 5 characters")
    .max(200, "Contact cannot exceed 200 characters")
    .refine(
      (val) => {
        // Validate email, phone, or URL
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        const urlRegex = /^https?:\/\/.+/;
        return (
          emailRegex.test(val) || phoneRegex.test(val) || urlRegex.test(val)
        );
      },
      { message: "Please enter a valid email, phone number, or URL" }
    ),

  // Secondary market fee (percentage, 0-50)
  secondaryMarketFee: z
    .number()
    .min(0, "Fee cannot be negative")
    .max(50, "Fee cannot exceed 50%"),

  // Creator address (wallet)
  creatorAddress: z
    .string()
    .min(1, "Creator address is required")
    .regex(
      /^[A-Z0-9]{56}$|^0x[a-fA-F0-9]{40}$/,
      "Invalid wallet address format"
    ),

  // Max supply
  maxSupply: z
    .number()
    .int("Must be a whole number")
    .min(1, "Must have at least 1 ticket")
    .max(1000000, "Maximum supply is 1,000,000"),

  // Primary price (must be > 0 for contract)
  primaryPrice: z
    .number()
    .min(0.0000001, "Price must be greater than 0")
    .max(1000000, "Price is too high"),

  // Create fee in basis points (0-10000, but contract may require > 0)
  createFeeBps: z
    .number()
    .int("Must be a whole number")
    .min(100, "Minimum fee is 1% (100 basis points)")
    .max(10000, "Fee cannot exceed 100%"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface CreateEventFormProps {
  creatorAddress?: string;
  onSubmit: (payload: EventCreatePayload) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function CreateEventForm({
  creatorAddress = "",
  onSubmit,
  isSubmitting = false,
}: CreateEventFormProps) {
  const timeInputId = useId();
  const [showCalendar, setShowCalendar] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);

  // Pinata upload hook
  const {
    uploadFile,
    isUploading: isUploadingToIpfs,
    error: ipfsError,
    progress: uploadProgress,
  } = usePinataUpload();

  // Form setup with explicit type
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      date: undefined as unknown as Date,
      time: "19:00",
      locationAddress: "",
      category: undefined as unknown as Category,
      image: "",
      contact: "",
      secondaryMarketFee: 5,
      creatorAddress: creatorAddress,
      maxSupply: 100,
      primaryPrice: 10, // 10 XLM default
      createFeeBps: 500, // 5% default (500 basis points)
    },
    mode: "onBlur",
  });

  // Handle file upload to IPFS
  const handleFileUploadToIpfs = useCallback(
    async (file: File) => {
      try {
        const result = await uploadFile(file);
        if (result.success) {
          setIpfsUrl(result.url);
          form.setValue("image", result.url, { shouldValidate: true });
        }
      } catch (error) {
        console.error("IPFS upload error:", error);
        // Keep local preview if IPFS upload fails
      }
    },
    [uploadFile, form]
  );

  // File upload hook
  const [
    { files, isDragging, errors: uploadErrors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp",
    maxSize: MAX_IMAGE_SIZE,
    onFilesAdded: (addedFiles: FileWithPreview[]) => {
      // When a new file is added, upload it to IPFS
      if (addedFiles.length > 0) {
        const file = addedFiles[0].file;
        if (file instanceof File) {
          // Set local preview first for immediate feedback
          form.setValue("image", addedFiles[0].preview || "", {
            shouldValidate: true,
          });
          // Then upload to IPFS
          handleFileUploadToIpfs(file);
        }
      }
    },
  });

  // Handle file removal - use useEffect to avoid setState during render
  useEffect(() => {
    if (files.length === 0) {
      form.setValue("image", "", { shouldValidate: true });
      setIpfsUrl(null);
    }
  }, [files.length, form]);

  const previewUrl = files[0]?.preview || null;

  // Form submission handler
  const handleFormSubmit = (values: EventFormValues) => {
    // Combine date and time into ISO string
    const [hours, minutes] = values.time.split(":").map(Number);
    const dateTime = new Date(values.date);
    dateTime.setHours(hours, minutes, 0, 0);

    const payload: EventCreatePayload = {
      name: values.name,
      creatorAddress: values.creatorAddress,
      maxSupply: values.maxSupply,
      primaryPrice: values.primaryPrice,
      createFeeBps: values.createFeeBps,
      metadata: {
        description: values.description,
        dateTime: dateTime.toISOString(),
        locationAddress: values.locationAddress,
        category: values.category,
        image: values.image,
        contact: values.contact,
        secondaryMarketFee: values.secondaryMarketFee,
      },
    };

    onSubmit(payload);
  };

  const selectedDate = form.watch("date");
  const maxSupply = form.watch("maxSupply");
  const secondaryMarketFee = form.watch("secondaryMarketFee");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
          {/* Main Form */}
          <div className="md:col-span-2 p-6 md:p-8 space-y-6 border-b md:border-b-0">
            {/* Event Details Section */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold">[EVENT_DETAILS]</h2>

              {/* Event Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">
                      EVENT_NAME *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter event name..."
                        className="border corner-accents bg-transparent focus:border-accent transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">
                      DESCRIPTION *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event..."
                        rows={4}
                        className="border corner-accents bg-transparent focus:border-accent transition-colors resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {field.value?.length || 0}/2000 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Picker */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-bold text-muted-foreground">
                        DATE *
                      </FormLabel>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal border corner-accents bg-transparent hover:border-accent"
                          onClick={() => setShowCalendar(!showCalendar)}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </Button>
                        {showCalendar && (
                          <div className="absolute top-full left-0 z-50 mt-1 rounded-md border bg-popover p-0 shadow-md">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setShowCalendar(false);
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                              className="p-2"
                            />
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Picker */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        htmlFor={timeInputId}
                        className="text-xs font-bold text-muted-foreground"
                      >
                        TIME *
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id={timeInputId}
                            type="time"
                            className="peer ps-9 border corner-accents bg-transparent focus:border-accent [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            {...field}
                          />
                        </FormControl>
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                          <ClockIcon aria-hidden="true" size={16} />
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="locationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">
                      LOCATION *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Event location or venue..."
                        className="border corner-accents bg-transparent focus:border-accent transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">
                      CATEGORY *
                    </FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {CATEGORIES.map((category) => (
                        <button
                          type="button"
                          key={category}
                          onClick={() => field.onChange(category)}
                          className={`border corner-accents px-3 py-2 text-sm transition-colors text-left ${
                            field.value === category
                              ? "bg-accent text-accent-foreground border-accent"
                              : "hover:bg-accent/5 hover:border-accent"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">
                      EVENT_IMAGE *
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          {/* Drop area */}
                          <div
                            className={`relative flex min-h-52 flex-col items-center justify-center overflow-hidden border corner-accents p-4 transition-colors ${
                              isDragging ? "bg-accent/10 border-accent" : ""
                            } ${previewUrl ? "" : "cursor-pointer"}`}
                            data-dragging={isDragging || undefined}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => !previewUrl && openFileDialog()}
                          >
                            <input
                              {...getInputProps()}
                              aria-label="Upload event image"
                              className="sr-only"
                            />
                            {previewUrl ? (
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  alt={
                                    (files[0]?.file as File)?.name ||
                                    "Event image"
                                  }
                                  className="mx-auto max-h-full rounded object-contain"
                                  src={previewUrl}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                                <div
                                  aria-hidden="true"
                                  className="mb-2 flex size-16 shrink-0 items-center justify-center border corner-accents bg-accent/10"
                                >
                                  <ImageIcon className="size-8 text-accent" />
                                </div>
                                <p className="mb-1 font-bold text-sm">
                                  [UPLOAD_IMAGE]
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  &gt; JPG, PNG, GIF, SVG, WEBP • MAX_
                                  {MAX_IMAGE_SIZE_MB}MB
                                </p>
                                <Button
                                  type="button"
                                  className="mt-4"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openFileDialog();
                                  }}
                                  variant="outline"
                                >
                                  <UploadIcon
                                    aria-hidden="true"
                                    className="-ms-1 size-4 opacity-60"
                                  />
                                  Select image
                                </Button>
                              </div>
                            )}
                          </div>

                          {previewUrl && (
                            <div className="absolute top-4 right-4">
                              <button
                                type="button"
                                aria-label="Remove image"
                                className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-colors hover:bg-black/80"
                                onClick={() => {
                                  removeFile(files[0]?.id);
                                  setIpfsUrl(null);
                                }}
                              >
                                <XIcon aria-hidden="true" className="size-4" />
                              </button>
                            </div>
                          )}

                          {/* IPFS Upload Overlay */}
                          {isUploadingToIpfs && previewUrl && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-40">
                              <Loader2Icon className="size-8 text-accent animate-spin mb-2" />
                              <p className="text-white text-sm font-bold mb-2">
                                [UPLOADING_TO_IPFS]
                              </p>
                              <div className="w-48">
                                <Progress
                                  value={uploadProgress}
                                  className="h-2"
                                />
                              </div>
                              <p className="text-white/70 text-xs mt-1">
                                {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* IPFS Status */}
                        {ipfsUrl && !isUploadingToIpfs && (
                          <div className="flex items-center gap-2 text-accent text-xs border corner-accents p-2 bg-accent/5">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span className="font-bold">[IPFS_PINNED]</span>
                            <span className="text-muted-foreground truncate flex-1">
                              {ipfsUrl.slice(0, 50)}...
                            </span>
                          </div>
                        )}

                        {uploadErrors.length > 0 && (
                          <div
                            className="flex items-center gap-1 text-destructive text-xs"
                            role="alert"
                          >
                            <AlertCircleIcon className="size-3 shrink-0" />
                            <span>{uploadErrors[0]}</span>
                          </div>
                        )}

                        {ipfsError && (
                          <div
                            className="flex items-center gap-1 text-yellow-500 text-xs"
                            role="alert"
                          >
                            <AlertCircleIcon className="size-3 shrink-0" />
                            <span>
                              IPFS upload failed: {ipfsError} (using local
                              preview)
                            </span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">
                      CONTACT *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email, phone, or website URL..."
                        className="border corner-accents bg-transparent focus:border-accent transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      How attendees can reach you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ticket Configuration */}
            <div className="space-y-5 pt-6 border-t">
              <h2 className="text-xl font-bold">[TICKET_CONFIG]</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Max Supply */}
                <FormField
                  control={form.control}
                  name="maxSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground">
                        TOTAL_SUPPLY *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          min={1}
                          max={1000000}
                          className="border corner-accents bg-transparent focus:border-accent transition-colors"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Total tickets available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Primary Price */}
                <FormField
                  control={form.control}
                  name="primaryPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground">
                        PRICE (XLM) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min={0}
                          className="border corner-accents bg-transparent focus:border-accent transition-colors"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Price per ticket (0 for free)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Secondary Market Fee */}
                <FormField
                  control={form.control}
                  name="secondaryMarketFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground">
                        RESALE_ROYALTY (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          step="0.5"
                          min={0}
                          max={50}
                          className="border corner-accents bg-transparent focus:border-accent transition-colors"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Your cut from secondary sales (0-50%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Create Fee BPS */}
                <FormField
                  control={form.control}
                  name="createFeeBps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground">
                        PLATFORM_FEE (BPS)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min={0}
                          max={10000}
                          className="border corner-accents bg-transparent focus:border-accent transition-colors"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Basis points (100 bps = 1%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Creator Address */}
              <FormField
                control={form.control}
                name="creatorAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">
                      CREATOR_WALLET *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="G... (Stellar) or 0x... (EVM)"
                        className="border corner-accents bg-transparent focus:border-accent transition-colors font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Wallet address to receive payments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sidebar - Summary */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold">[SUMMARY]</h3>

              <div className="border corner-accents divide-y">
                <div className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="text-xs text-muted-foreground">
                    TOTAL_SUPPLY
                  </div>
                  <div className="font-bold text-accent">
                    {maxSupply || 0} TICKETS
                  </div>
                </div>
                <div className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="text-xs text-muted-foreground">
                    RESALE_ROYALTY
                  </div>
                  <div className="font-bold">{secondaryMarketFee || 0}%</div>
                </div>
                <div className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="text-xs text-muted-foreground">
                    EVENT_DATE
                  </div>
                  <div className="font-bold">
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "—"}
                  </div>
                </div>
                <div className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="text-xs text-muted-foreground">EST_GAS</div>
                  <div className="font-bold">~0.02 XLM</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="w-full border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-3 bg-accent/5 disabled:opacity-50"
                variant="ghost"
              >
                <span className="text-sm font-bold">
                  {isSubmitting ? "[CREATING...]" : "[CREATE_EVENT]"}
                </span>
                {!isSubmitting && <ArrowUpRight className="w-4 h-4" />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full border corner-accents flex hover:bg-muted/30 cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-2"
                onClick={() => form.reset()}
              >
                <span className="text-sm font-bold">[RESET]</span>
              </Button>
            </div>

            <div className="border corner-accents p-4 bg-muted/5 space-y-2">
              <div className="text-xs font-bold">[INFO]</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>&gt; TICKETS_ARE_ERC721</p>
                <p>&gt; IMMUTABLE_ON_CHAIN</p>
                <p>&gt; YOU_KEEP_100%_SALES</p>
                <p>&gt; INSTANT_SETTLEMENT</p>
              </div>
            </div>

            {/* Form Errors Summary */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="border border-destructive/50 corner-accents p-4 bg-destructive/5 space-y-2">
                <div className="text-xs font-bold text-destructive">
                  [VALIDATION_ERRORS]
                </div>
                <div className="text-xs text-destructive space-y-1">
                  {Object.entries(form.formState.errors).map(([key, error]) => (
                    <p key={key}>
                      &gt; {key.toUpperCase()}: {error?.message as string}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}

export default CreateEventForm;
