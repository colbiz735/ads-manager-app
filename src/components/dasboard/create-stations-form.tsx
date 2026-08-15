"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Radio, Pencil } from "lucide-react";
import { CreateStationDto, StationResponse } from "@/src/types/interfaces";
import { AdCategory, DEFAULT_AD_CATEGORIES } from "@/src/types/enums";
import { toast } from "react-toastify";
import { useCreateStation, useUpdateStation } from "@/src/hooks/use-stations";

const Req = () => <span className="text-red-500 ml-0.5">*</span>;
const Opt = () => (
  <span className="text-[10px] font-normal text-slate-400 ml-1">
    (optional)
  </span>
);
const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-[11px] text-red-500 mt-1">{message}</p> : null;

const inputBase =
  "w-full text-sm border rounded-lg px-3 py-2 outline-none transition-colors text-slate-700 bg-white";
const inputNormal = `${inputBase} border-slate-200 focus:border-slate-400`;
const inputError = `${inputBase} border-red-400 focus:border-red-500`;

interface StationFormProps {
  /** When set the form switches to edit mode prefilled with this station */
  editTarget: StationResponse | null;
  onCancelEdit: () => void;
}

export default function CreateStationForm({
  editTarget,
  onCancelEdit,
}: StationFormProps) {
  const isEditMode = !!editTarget;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateStationDto>({
    defaultValues: {
      name: "",
      address: "",
      device: "",
      supportedCategories: [],
    },
  });

  const watchedCategories = watch("supportedCategories") || [];

  // Prefill when an edit target is injected
  useEffect(() => {
    if (editTarget) {
      reset({
        name: editTarget.name,
        address: editTarget.address ?? "",
        device: editTarget.device ?? "",
        supportedCategories: editTarget.supportedCategories ?? [],
      });
    } else {
      reset({ name: "", address: "", device: "", supportedCategories: [] });
    }
  }, [editTarget, reset]);

  const toggleCategory = (cat: AdCategory) => {
    const updated = watchedCategories.includes(cat)
      ? watchedCategories.filter((c) => c !== cat)
      : [...watchedCategories, cat];
    setValue("supportedCategories", updated, { shouldValidate: true });
  };

  const createStationMutation = useCreateStation();
  const updateStationMutation = useUpdateStation(onCancelEdit, editTarget);

  const isPending =
    createStationMutation.isPending || updateStationMutation.isPending;

  const onSubmit = (data: CreateStationDto) => {
    if (isEditMode) {
      updateStationMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Station updated successfully");
        },
        onError: (err) => {
          toast.error(`Failed to update station: ${err.message}`);
        },
      });
    } else {
      createStationMutation.mutate(data, {
        onSuccess: () => {
          // Reset form fields
          reset({ name: "", address: "", device: "", supportedCategories: [] });
          toast.success("Successfully updated station.");
        },
        onError: (err) => {
          toast.error(`Failed to update station: ${err.message}`);
        },
      });
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <span className="h-6 w-6 flex items-center justify-center rounded-md bg-amber-60 text-amber-800">
              <Pencil size={13} />
            </span>
          ) : (
            <span className="h-6 w-6 flex items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Radio size={13} />
            </span>
          )}
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            {isEditMode ? `Edit — ${editTarget!.name}` : "Register Station"}
          </h2>
        </div>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={13} /> Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Station Name <Req />
          </label>
          <input
            type="text"
            placeholder="e.g. Lagos Airport Terminal 1"
            {...register("name", { required: "Station name is required." })}
            className={errors.name ? inputError : inputNormal}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Address <Opt />
          </label>
          <input
            type="text"
            placeholder="e.g. No 2 London Street, Ikeja"
            {...register("address")}
            className={inputNormal}
          />
        </div>

        {/* Device */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Device ID <Opt />
          </label>
          <input
            type="text"
            placeholder="e.g. Raspberry4"
            {...register("device")}
            className={inputNormal}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            The hardware identifier of the device at this station.
          </p>
        </div>

        {/* Supported Categories — chip toggler */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Supported Categories <Req />
          </label>
          <div
            className={`flex flex-wrap gap-1.5 border rounded-lg p-2.5 min-h-[48px] transition-colors ${
              errors.supportedCategories ? "border-red-400" : "border-slate-200"
            }`}
          >
            {DEFAULT_AD_CATEGORIES.map((cat) => {
              const active = watchedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all capitalize ${
                    active
                      ? "bg-slate-800 border-slate-800 text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          {/* hidden input to carry validation */}
          <input
            type="hidden"
            {...register("supportedCategories", {
              validate: (v) =>
                v.length > 0 || "Select at least one supported category.",
            })}
          />
          <FieldError message={errors.supportedCategories?.message as string} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-white disabled:opacity-50 ${
            isEditMode
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isPending
            ? isEditMode
              ? "Saving changes..."
              : "Registering..."
            : isEditMode
              ? "Save Changes"
              : "Register Station"}
        </button>
      </form>
    </div>
  );
}
