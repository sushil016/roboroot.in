"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { addressApi } from "@/features/user/services/address.service";
import type { Address, AddressInput } from "@/types/marketplace.types";
import { MagicCard } from "@/components/ui/magic-card";

const emptyAddress: AddressInput = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Puducherry","Chandigarh",
];

function addressToForm(address: Address): AddressInput {
  return {
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 || "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none transition-colors placeholder:text-zinc-400 focus:border-[var(--brand-primary)] focus:bg-white";

export function AddressBook() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressInput>(emptyAddress);

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.list(),
  });

  const addresses = useMemo(() => addressesQuery.data || [], [addressesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => (editingId ? addressApi.update(editingId, form) : addressApi.create(form)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingId("");
      setForm(emptyAddress);
      setShowForm(false);
      toast.success(editingId ? "Address updated" : "Address added");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save address");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefault(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update default address");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => addressApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove address");
    },
  });

  function openNewForm() {
    setEditingId("");
    setForm(emptyAddress);
    setShowForm(true);
  }

  function editAddress(address: Address) {
    setEditingId(address.id);
    setForm(addressToForm(address));
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId("");
    setForm(emptyAddress);
  }

  function removeAddress(address: Address) {
    if (!window.confirm(`Remove address for ${address.name}?`)) return;
    removeMutation.mutate(address.id);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function field(key: keyof AddressInput) {
    return {
      value: String(form[key] || ""),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8E8E6]">
            <MapPin className="h-3.5 w-3.5 text-zinc-600" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Address Book
          </h2>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#D2D2D0] bg-white px-3 text-xs font-semibold text-zinc-600 transition-colors hover:border-[#222222] hover:text-[#222222]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Address
          </button>
        )}
      </div>

      {/* Address cards */}
      <div className="space-y-3">
        {addressesQuery.isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#D2D2D0] bg-white px-4 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
            <p className="text-sm text-zinc-400">Loading addresses...</p>
          </div>
        )}

        {!addressesQuery.isLoading && addresses.length === 0 && !showForm && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#D2D2D0] bg-[#F2F2F0] py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E8E6]">
              <MapPin className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#222222]">No saved addresses</p>
              <p className="mt-0.5 text-xs text-zinc-500">Add an address to speed up checkout.</p>
            </div>
            <button
              type="button"
              onClick={openNewForm}
              className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#222222] px-4 text-xs font-bold text-white hover:bg-[var(--brand-primary)] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Your First Address
            </button>
          </div>
        )}

        {addresses.map((address, i) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="var(--brand-primary)"
              gradientTo="#E8E8E6"
              gradientColor="var(--brand-primary)"
              gradientOpacity={0.04}
            >
              <div className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-[#222222]">{address.name}</p>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-primary)]">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-5 text-zinc-500">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {address.city}, {address.state} — {address.pincode}
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-400">
                      {address.phone} · {address.country}
                    </p>
                  </div>

                  <div className="flex flex-wrap shrink-0 gap-2">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => defaultMutation.mutate(address.id)}
                        disabled={defaultMutation.isPending}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D2D2D0] px-2.5 text-xs font-semibold text-zinc-500 transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:opacity-50"
                      >
                        <Star className="h-3 w-3" />
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => editAddress(address)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D2D2D0] px-2.5 text-xs font-semibold text-zinc-500 transition-colors hover:border-[#222222] hover:text-[#222222]"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAddress(address)}
                      disabled={removeMutation.isPending}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-100 px-2.5 text-xs font-semibold text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </MagicCard>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="var(--brand-primary)"
              gradientTo="#E8E8E6"
              gradientColor="var(--brand-primary)"
              gradientOpacity={0.06}
            >
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#222222]">
                    {editingId ? "Edit Address" : "New Address"}
                  </h3>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-[#E8E8E6] hover:text-zinc-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldGroup label="Full Name">
                    <input {...field("name")} placeholder="Sushil Sahani" className={inputCls} required />
                  </FieldGroup>
                  <FieldGroup label="Phone Number">
                    <input {...field("phone")} placeholder="+91 98765 43210" className={inputCls} required />
                  </FieldGroup>
                </div>

                <FieldGroup label="Address Line 1">
                  <input {...field("line1")} placeholder="House no., Street, Area" className={inputCls} required />
                </FieldGroup>

                <FieldGroup label="Address Line 2 (optional)">
                  <input {...field("line2")} placeholder="Landmark, Colony" className={inputCls} />
                </FieldGroup>

                <div className="grid gap-3 sm:grid-cols-3">
                  <FieldGroup label="City">
                    <input {...field("city")} placeholder="Mumbai" className={inputCls} required />
                  </FieldGroup>
                  <FieldGroup label="State">
                    <select
                      value={form.state}
                      onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                      className={inputCls}
                      required
                    >
                      <option value="">Select state</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Pincode">
                    <input
                      {...field("pincode")}
                      placeholder="400001"
                      maxLength={6}
                      pattern="\d{6}"
                      className={inputCls}
                      required
                    />
                  </FieldGroup>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-4 py-3 transition-colors hover:border-[var(--brand-primary)]">
                  <div className="relative flex shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={Boolean(form.isDefault)}
                      onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      className="sr-only"
                    />
                    <div
                      className={`h-4 w-4 rounded border-2 transition-colors ${
                        form.isDefault ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-[#D2D2D0] bg-white"
                      }`}
                    >
                      {form.isDefault && (
                        <svg viewBox="0 0 10 8" className="h-full w-full fill-none stroke-white stroke-[1.5]">
                          <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#222222]">Set as default address</p>
                    <p className="text-[11px] text-zinc-500">Used automatically during checkout</p>
                  </div>
                </label>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#222222] text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary)] disabled:opacity-50"
                  >
                    {saveMutation.isPending
                      ? "Saving..."
                      : editingId
                      ? "Update Address"
                      : "Save Address"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="h-10 rounded-xl border border-[#D2D2D0] px-4 text-sm font-semibold text-zinc-600 transition-colors hover:border-[#222222] hover:text-[#222222]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </MagicCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
