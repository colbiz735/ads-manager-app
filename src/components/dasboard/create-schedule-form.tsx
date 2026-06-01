"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller, set } from "react-hook-form";
import {
  UploadCloud,
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Monitor,
  ToggleLeft,
  ArrowRight,
  X,
} from "lucide-react";
import {
  DEFAULT_AD_CATEGORIES,
  OwnershipType,
  Weekday,
} from "@/src/types/enums";
import { CreateScheduleDto, MediaType } from "@/src/types/interfaces";
import {
  SCHEDULE_KEYS,
  useCreateSchedule,
  useUploadMedia,
} from "@/src/hooks/use-schedules";
import { toast } from "react-toastify";
import { defaultCreateSchedule } from "@/src/lib/constants";
import { apiService } from "@/src/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchStations } from "@/src/hooks/use-stations";

interface CreateScheduleFormProps {
  onSuccess: () => void;
}

// Helper: required field label asterisk
const Req = () => <span className="text-red-500 ml-0.5">*</span>;

// Helper: inline field error message
const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-[11px] text-red-500 mt-1">{message}</p> : null;

export default function CreateScheduleForm({
  onSuccess,
}: CreateScheduleFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<{
    mediaUrl: string;
    mediaId: string;
    mediaType: MediaType;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    setFocus,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateScheduleDto>({
    defaultValues: defaultCreateSchedule,
  });

  const {
    fields: timeSlotFields,
    append: appendTimeSlot,
    remove: removeTimeSlot,
  } = useFieldArray({
    control,
    name: "timeSlots",
  });

  const watchedLocationIds = watch("locationIds") || [];
  const selectedStationId = watchedLocationIds[0] || "";
  const watchedPriority = watch("priority") ?? 3;
  const watchedTargetDevices = watch("targetDevices") || [];
  const watchedWeekdays = watch("weekdays") || [];
  const watchedFrequencyType = watch("frequency.type");

  // Instantiate hook modules
  const { data: stationList = [] } = useFetchStations();
  const uploadMediaMutation = useUploadMedia();

  const queryClient = useQueryClient();
  const createScheduleMutation = useCreateSchedule();

  // Derive available categories based on station selection
  const activeSelectedStation = stationList.find(
    (s) => s.id === selectedStationId,
  );
  const availableCategories: string[] =
    selectedStationId && activeSelectedStation
      ? activeSelectedStation.supportedCategories
      : DEFAULT_AD_CATEGORIES;

  // Reset category whenever the station changes so the user explicitly picks one
  useEffect(() => {
    setValue("category", "");
    if (!selectedStationId) {
      setValue("ownership", OwnershipType.GLOBAL);
    }
  }, [selectedStationId, setValue]);

  // Handle real media upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Executes the request through your multipart Form Data engine
      const response = await uploadMediaMutation.mutateAsync(selectedFile);

      setUploadedMedia({
        mediaUrl: response.mediaUrl,
        mediaId: response.mediaId,
        mediaType: response.mediaType as MediaType,
      });

      setValue("mediaType", response.mediaType as MediaType);
      setValue("mediaUrl", response.mediaUrl);
      setValue("mediaId", response.mediaId);
      clearErrors("mediaUrl");
      setIsUploading(false);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Upload failure diagnostics:", error);
      toast.error("Failed to upload campaign media asset.");
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Clear uploaded media
  const handleClearMedia = async () => {
    if (uploadedMedia) {
      setIsDeleting(true);

      try {
        await apiService.deleteMedia(
          uploadedMedia.mediaId,
          uploadedMedia.mediaUrl,
        );

        setUploadedMedia(null);
        setValue("mediaUrl", "" as MediaType);
        setValue("mediaType", "" as MediaType);
        setValue("mediaId", "" as MediaType);
        clearErrors("mediaUrl");
        setIsDeleting(false);
      } catch (error) {
        setIsDeleting(false);
        toast.error("Failed to delete campaign media asset. Please try again.");
      }
    }
  };

  // Before RHF validation runs, manually validate the media upload since it's
  // outside the form's register flow, then focus the first error field.
  const onSubmit = (data: CreateScheduleDto) => {
    if (!uploadedMedia) {
      setError("mediaUrl", {
        message: "Please upload a media file before submitting.",
      });
      setShowUploadModal(true);
      return;
    }

    createScheduleMutation.mutate(data, {
      onSuccess: () => {
        setUploadedMedia(null);

        // Reset form fields
        reset(defaultCreateSchedule);
        if (timeSlotFields.length > 1) {
          timeSlotFields.forEach((_, i) => removeTimeSlot(i));
        }

        // Auto refresh schedule list
        queryClient.invalidateQueries({ queryKey: SCHEDULE_KEYS.schedules });
        setUploadedMedia(null);

        toast.success("Successfully scheduled a new broadcast.");
        onSuccess();
      },
      onError: (err) => {
        toast.error(`Failed to create schedule: ${err.message}`);
      },
    });
  };

  const onInvalid = (errs: typeof errors) => {
    // Focus the first field with an error in document order
    const fieldOrder: Array<keyof CreateScheduleDto> = [
      "mediaUrl",
      "duration",
      "startDate",
      "endDate",
      "category",
    ];
    for (const field of fieldOrder) {
      if (errs[field]) {
        setFocus(field);
        break;
      }
    }
  };

  const deviceOptions = ["Raspberry", "Billboard"];

  const toggleDevice = (device: string) => {
    const updated = watchedTargetDevices.includes(device)
      ? watchedTargetDevices.filter((d) => d !== device)
      : [...watchedTargetDevices, device];
    setValue("targetDevices", updated);
  };

  const toggleWeekday = (day: Weekday) => {
    const updated = watchedWeekdays.includes(day)
      ? watchedWeekdays.filter((d) => d !== day)
      : [...watchedWeekdays, day];
    setValue("weekdays", updated);
  };

  const WEEKDAY_LABELS: { value: Weekday; label: string }[] = [
    { value: Weekday.MONDAY, label: "Mon" },
    { value: Weekday.TUESDAY, label: "Tue" },
    { value: Weekday.WEDNESDAY, label: "Wed" },
    { value: Weekday.THURSDAY, label: "Thu" },
    { value: Weekday.FRIDAY, label: "Fri" },
    { value: Weekday.SATURDAY, label: "Sat" },
    { value: Weekday.SUNDAY, label: "Sun" },
  ];

  const inputBase =
    "w-full text-sm border rounded-lg px-3 py-2 outline-none transition-colors";
  const inputNormal = `${inputBase} border-slate-200 focus:border-slate-400 text-slate-700 bg-white cursor-pointer`;
  const inputError = `${inputBase} border-red-400 focus:border-red-500 text-slate-700 bg-white`;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
          New Schedule
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          ID: SCH-2024-001
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Media URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Media URL <Req />
          </label>

          {!uploadedMedia ? (
            <>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className={`w-full flex items-center gap-3 border rounded-lg px-3 py-2.5 bg-white hover:border-slate-300 transition-colors text-left cursor-pointer ${
                  errors.mediaUrl ? "border-red-400" : "border-slate-200"
                }`}
              >
                <UploadCloud className="h-4 w-4 text-slate-800 shrink-0" />
                <span className="text-sm text-slate-800">
                  Click to upload campaign creative
                </span>
              </button>

              <FieldError message={errors.mediaUrl?.message} />
            </>
          ) : (
            <div className="flex items-center justify-between border border-emerald-200 bg-emerald-50/40 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  {uploadedMedia.mediaType === "video" ? (
                    <Film size={12} />
                  ) : (
                    <ImageIcon size={12} />
                  )}
                </div>

                {isDeleting ? (
                  <div className="flex gap-2 items-center">
                    <span className="h-4 w-4 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin"></span>
                    <p className="text-xs font-medium text-slate-800 truncate">
                      Deleting...
                    </p>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-emerald-900 truncate  max-w-[200px] md:max-w-[400px]">
                    {uploadedMedia.mediaUrl}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleClearMedia()}
                className="text-slate-400 hover:text-red-500 transition-colors ml-2 shrink-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Upload Modal ── */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">
                  Upload Campaign Asset
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                {/* Native HTML file input tag */}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={uploadMediaMutation.isPending || isUploading}
                  className="hidden"
                  id="media-file-picker"
                />

                {/* Visual trigger tied to the file input via the htmlFor attribute */}
                <label
                  htmlFor="media-file-picker"
                  className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-8 bg-slate-50 hover:bg-indigo-50/10 transition-all group cursor-pointer data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60"
                  data-disabled={uploadMediaMutation.isPending || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="h-7 w-7 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin mb-3" />
                      <span className="text-sm font-semibold text-slate-600">
                        Uploading...
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Please wait
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-7 w-7 text-slate-400 group-hover:text-indigo-500 transition-colors mb-2" />
                      <span className="text-sm font-semibold text-slate-700 cursor-pointer">
                        Click to upload campaign media
                      </span>
                      <span className="text-xs text-slate-400 mt-1 font-normal">
                        Supports high-res MP4 or PNG banners
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── Create Schedule Form — gated on media upload */}
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className={`space-y-5 ${!uploadedMedia ? "opacity-40 pointer-events-none" : ""}`}
        >
          {/* Media Type (read-only) + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Media Type <Req />
              </label>
              <input
                readOnly
                value={uploadedMedia?.mediaType ?? ""}
                placeholder="Auto-detected on upload"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-500 cursor-not-allowed capitalize"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Duration (Sec) <Req />
              </label>
              <input
                type="number"
                {...register("duration", {
                  required: "Duration is required.",
                  min: { value: 1, message: "Must be at least 1 second." },
                  valueAsNumber: true,
                })}
                className={errors.duration ? inputError : inputNormal}
                placeholder="15"
              />
              <FieldError message={errors.duration?.message} />
            </div>
          </div>

          {/* Start Date + End Date */}
          {/* Start Date + End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400 cursor-pointer" /> Start Date{" "}
                <Req />
              </label>
              <input
                type="date"
                {...register("startDate", {
                  required: "Start date is required.",
                  validate: (val) => {
                    const end = watch("endDate");
                    if (!end) return true;
                    return val <= end || "Start date cannot be after end date.";
                  },
                })}
                className={errors.startDate ? inputError : inputNormal}
              />
              <FieldError message={errors.startDate?.message} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400 cursor-pointer" /> End Date{" "}
                <Req />
              </label>
              <input
                type="date"
                {...register("endDate", {
                  required: "End date is required.",
                  validate: (val) => {
                    const start = watch("startDate");
                    if (!val || !start) return true;
                    return (
                      val >= start || "End date cannot be before start date."
                    );
                  },
                })}
                onChange={(e) => {
                  // Manually sync value then re-trigger startDate validation
                  // so both fields update their error state simultaneously
                  setValue("endDate", e.target.value, {
                    shouldValidate: false,
                  });
                  trigger("startDate");
                  trigger("endDate");
                }}
                className={errors.endDate ? inputError : inputNormal}
              />
              <FieldError message={errors.endDate?.message} />
            </div>
          </div>

          {/* Priority Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-600">
                Priority (1–10)
              </label>
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {watchedPriority}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              {...register("priority", { valueAsNumber: true })}
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-800"
            />
          </div>

          {/* Weekdays */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Active Days{" "}
              <span className="text-[11px] font-normal text-slate-400">
                (optional — leave empty for all days)
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_LABELS.map(({ value, label }) => {
                const active = watchedWeekdays.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleWeekday(value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      active
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Devices — chip style */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <Monitor size={12} className="text-slate-400" /> Target Devices
            </label>
            <div className="flex flex-wrap gap-2 border border-slate-200 rounded-lg p-2.5 bg-white min-h-[42px]">
              {watchedTargetDevices.map((device) => (
                <span
                  key={device}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full"
                >
                  {device}
                  <button
                    type="button"
                    onClick={() => toggleDevice(device)}
                    className="text-slate-400 hover:text-slate-600 ml-0.5 transition-colors cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              {deviceOptions
                .filter((d) => !watchedTargetDevices.includes(d))
                .map((device) => (
                  <button
                    key={device}
                    type="button"
                    onClick={() => toggleDevice(device)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 border border-dashed border-slate-300 px-2.5 py-1 rounded-full 
                    hover:border-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <Plus size={11} /> {device}
                  </button>
                ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" /> Time Slots
              </label>
              {timeSlotFields.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    appendTimeSlot({ start: "09:00", end: "18:00" })
                  }
                  className="text-xs text-slate-500 font-medium hover:text-slate-700 flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <Plus size={13} className="cursor-pointer"/> Add another slot
                </button>
              )}
            </div>
            <div className="space-y-2">
              {timeSlotFields.map((field, index) => {
                const slotStartErr = errors.timeSlots?.[index]?.start;
                const slotEndErr = errors.timeSlots?.[index]?.end;

                return (
                  <div key={field.id}>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        {...register(`timeSlots.${index}.start` as const, {
                          required: "Required.",
                          validate: (val) => {
                            const end = watch(`timeSlots.${index}.end`);
                            if (!end || !val) return true;
                            return (
                              val < end || "Start must be before end time."
                            );
                          },
                        })}
                        className={`flex-1 text-sm border rounded-lg px-3 py-2 outline-none focus:border-slate-400 text-slate-700 cursor-pointer ${
                          slotStartErr ? "border-red-400" : "border-slate-200"
                        }`}
                      />
                      <ArrowRight
                        size={14}
                        className="text-slate-400 shrink-0"
                      />
                      <input
                        type="time"
                        {...register(`timeSlots.${index}.end` as const, {
                          required: "Required.",
                          validate: (val) => {
                            const start = watch(`timeSlots.${index}.start`);
                            if (!start || !val) return true;
                            return (
                              val > start || "End must be after start time."
                            );
                          },
                        })}
                        onChange={(e) => {
                          setValue(`timeSlots.${index}.end`, e.target.value, {
                            shouldValidate: false,
                          });
                          trigger(`timeSlots.${index}.start`);
                          trigger(`timeSlots.${index}.end`);
                        }}
                        className={`flex-1 text-sm border rounded-lg px-3 py-2 outline-none focus:border-slate-400 text-slate-700 cursor-pointer ${
                          slotEndErr ? "border-red-400" : "border-slate-200"
                        }`}
                      />
                      {timeSlotFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="text-slate-300 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    {/* Per-slot error — shows whichever message is relevant */}
                    {(slotStartErr || slotEndErr) && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {slotStartErr?.message || slotEndErr?.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frequency + Interval Seconds */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Frequency
              </label>
              <select {...register("frequency.type")} className={inputNormal}>
                <option value="loop">Loop</option>
                <option value="interval">Interval</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Interval Seconds{" "}
                {watchedFrequencyType === "interval" && <Req />}
              </label>
              <input
                type="number"
                placeholder="e.g. 60"
                {...register("frequency.intervalSeconds", {
                  valueAsNumber: true,
                  validate: (val) =>
                    watchedFrequencyType !== "interval" || (!!val && val > 0)
                      ? true
                      : "Required when frequency is set to Interval.",
                })}
                className={
                  errors.frequency?.intervalSeconds ? inputError : inputNormal
                }
              />
              <FieldError
                message={errors.frequency?.intervalSeconds?.message}
              />
            </div>
          </div>

          {/* Location → Category (stacked, category options driven by station) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" /> Location
              </label>
              <select
                onChange={(e) => {
                  setValue(
                    "locationIds",
                    e.target.value ? [e.target.value] : [],
                  );
                }}
                value={selectedStationId}
                className={inputNormal}
              >
                <option value="">Global Coverage (No Specific Location)</option>
                {stationList.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} — {station.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Ownership — only visible when a station is selected */}
            {selectedStationId && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <ToggleLeft size={13} className="text-slate-400" />{" "}
                    Ownership
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Delivery target for localized display.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {Object.values(OwnershipType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue("ownership", type)}
                      className={`text-xs px-3 py-1.5 font-medium rounded-lg border transition-all capitalize ${
                        watch("ownership") === type
                          ? "bg-slate-800 border-slate-800 text-white"
                          : "border-slate-200 text-slate-500 hover:bg-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category — options come from selected station or DEFAULT_AD_CATEGORIES */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Category <Req />
                {selectedStationId && (
                  <span className="ml-1.5 text-[11px] font-normal text-slate-400 normal-case">
                    — filtered by selected station
                  </span>
                )}
              </label>
              {/* key forces re-mount (and value reset) when station changes */}
              <select
                key={selectedStationId}
                {...register("category", { required: "Category is required." })}
                className={errors.category ? inputError : inputNormal}
              >
                <option value="">Select a category</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
              <FieldError message={errors.category?.message} />
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tags
              </label>
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, value } }) => {
                  // Safely convert the underlying array back to a string for display in the input box
                  const displayValue = Array.isArray(value)
                    ? value.join(", ")
                    : value;

                  return (
                    <input
                      type="text"
                      placeholder="e.g. summer, promo, lagos"
                      className={inputNormal}
                      value={displayValue}
                      onChange={(e) => {
                        onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        const rawText = e.target.value;
                        const cleanArray = rawText
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0);

                        onChange(cleanArray);
                      }}
                    />
                  );
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createScheduleMutation.isPending}
            className="w-full mt-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors cursor-pointer"
          >
            {createScheduleMutation.isPending
              ? "Publishing..."
              : "Create Schedule"}
          </button>
        </form>
      </div>
    </div>
  );
}
