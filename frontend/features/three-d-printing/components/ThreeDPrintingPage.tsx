"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import {
  ArrowRight,
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileBox,
  FileUp,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Weight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/user.store";
import { formatPrice } from "@/store/cart.store";
import { addressApi } from "@/features/user/services/address.service";
import { initiatePayment } from "@/features/payment/services/payment.service";
import { threeDPrintingApi } from "../services/three-d-printing.service";
import type {
  PrintFinish,
  PrintModelFile,
  PrintQuality,
  PrintQuote,
} from "../types";

const ModelPreview = dynamic(() => import("./ModelPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-[52vh] min-h-[420px] animate-pulse bg-zinc-900 lg:h-[calc(100vh-13rem)] lg:min-h-[560px]" />
  ),
});

const QUALITY_OPTIONS: Array<{ value: PrintQuality; label: string; layer: string }> = [
  { value: "DRAFT", label: "Draft", layer: "0.28 mm" },
  { value: "STANDARD", label: "Standard", layer: "0.20 mm" },
  { value: "FINE", label: "Fine", layer: "0.12 mm" },
];

const FINISH_OPTIONS: Array<{ value: PrintFinish; label: string }> = [
  { value: "RAW", label: "Raw print" },
  { value: "SUPPORT_REMOVAL", label: "Support removal" },
  { value: "SANDED", label: "Sanded" },
  { value: "PRIMED", label: "Primed" },
  { value: "PAINTED", label: "Painted" },
];

const COLOR_HEX: Record<string, string> = {
  Black: "#242424",
  White: "#f4f4f3",
  Red: "#e54b4b",
  Blue: "#3487d8",
  Green: "#3a9b64",
  Yellow: "#e4b735",
  Grey: "#8b9198",
  Gray: "#8b9198",
  Clear: "#bfd9dc",
};

const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);
}

export function ThreeDPrintingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<PrintModelFile | null>(null);
  const [materialId, setMaterialId] = useState("");
  const [color, setColor] = useState("Black");
  const [quality, setQuality] = useState<PrintQuality>("STANDARD");
  const [finish, setFinish] = useState<PrintFinish>("RAW");
  const [infillPercent, setInfillPercent] = useState(20);
  const [quantity, setQuantity] = useState(1);
  const [quote, setQuote] = useState<PrintQuote | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [customerNotes, setCustomerNotes] = useState("");
  const [isQuoting, setIsQuoting] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const configQuery = useQuery({
    queryKey: ["3d-print-config"],
    queryFn: threeDPrintingApi.getConfig,
    staleTime: 5 * 60 * 1000,
  });
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: addressApi.list,
    enabled: isAuthenticated,
  });

  const config = configQuery.data;
  const materials = useMemo(
    () => config?.materials.filter((item) => item.isActive) ?? [],
    [config],
  );
  const selectedMaterial =
    materials.find((item) => item.id === materialId) ?? materials[0];
  const addresses = useMemo(() => addressesQuery.data ?? [], [addressesQuery.data]);

  useEffect(() => {
    if (!selectedMaterial && materials[0]) {
      setMaterialId(materials[0].id);
      setColor(materials[0].colors[0] ?? "Black");
    }
  }, [materials, selectedMaterial]);

  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
    setSelectedAddressId(defaultAddress.id);
  }, [addresses, selectedAddressId]);

  function invalidateQuote() {
    setQuote(null);
  }

  function selectFile(nextFile: File | undefined) {
    if (!nextFile) return;
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "stl" && extension !== "obj") {
      toast.error("Only STL and OBJ model files are supported");
      return;
    }
    const limitMb = config?.maxFileSizeMb ?? 50;
    if (nextFile.size > limitMb * 1024 * 1024) {
      toast.error("The model must be " + limitMb + " MB or smaller");
      return;
    }
    setFile(nextFile);
    setUploadedFile(null);
    invalidateQuote();
  }

  function getConfiguration(fileId: string) {
    if (!selectedMaterial) throw new Error("Select a print material");
    return {
      fileId,
      materialId: selectedMaterial.id,
      color,
      quality,
      finish,
      infillPercent,
      quantity,
    };
  }

  async function handleGetPrice() {
    if (!file) {
      toast.error("Select an STL or OBJ model");
      inputRef.current?.click();
      return;
    }
    if (!isAuthenticated) {
      router.push("/login?redirect=/3d-printing");
      return;
    }
    if (!config?.isEnabled) {
      toast.error("3D printing orders are temporarily paused");
      return;
    }

    setIsQuoting(true);
    try {
      const model = uploadedFile ?? (await threeDPrintingApi.uploadModel(file));
      setUploadedFile(model);
      const nextQuote = await threeDPrintingApi.calculateQuote(getConfiguration(model.id));
      setQuote(nextQuote);
      toast.success("Instant price calculated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not calculate this model");
    } finally {
      setIsQuoting(false);
    }
  }

  function newAddressIsComplete() {
    return Boolean(
      newAddress.name.trim() &&
        newAddress.phone.trim() &&
        newAddress.line1.trim() &&
        newAddress.city.trim() &&
        newAddress.state.trim() &&
        newAddress.pincode.trim(),
    );
  }

  async function handlePlaceOrder() {
    if (!quote || !uploadedFile) {
      toast.error("Calculate the current configuration first");
      return;
    }
    if ((!useNewAddress && !selectedAddressId) || (useNewAddress && !newAddressIsComplete())) {
      toast.error("Add a complete delivery address");
      return;
    }

    setIsOrdering(true);
    let printOrderId = "";
    try {
      const created = await threeDPrintingApi.createOrder({
        ...getConfiguration(uploadedFile.id),
        ...(useNewAddress
          ? { shippingAddress: newAddress }
          : { shippingAddressId: selectedAddressId }),
        ...(customerNotes.trim() ? { customerNotes: customerNotes.trim() } : {}),
      });
      printOrderId = created.order.id;
      const payment = await initiatePayment(created.commerceOrderId);
      if (payment.gateway === "ZOHO") {
        window.location.assign(payment.checkoutUrl);
        return;
      }
      window.location.assign("/checkout/payment/" + created.commerceOrderId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the print order");
      if (printOrderId) router.push("/3d-printing/orders/" + printOrderId);
    } finally {
      setIsOrdering(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-7 text-white sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
              <Box className="h-4 w-4" />
              Fabrication service
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">3D Printing Studio</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              STL and OBJ manufacturing with server-verified, weight-based pricing.
            </p>
          </div>
          <Link
            href="/3d-printing/orders"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold transition hover:border-zinc-500 hover:bg-zinc-900"
          >
            <PackageCheck className="h-4 w-4" />
            My print orders
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] lg:grid-cols-[minmax(0,1.4fr)_460px]">
        <section className="min-w-0 border-b border-zinc-300 lg:h-fit lg:border-b-0 lg:border-r">
          <ModelPreview file={file} color={color} />
          <div className="grid grid-cols-2 border-t border-zinc-800 bg-zinc-950 text-white sm:grid-cols-4">
            <Metric label="Format" value={uploadedFile?.format ?? file?.name.split(".").pop()?.toUpperCase() ?? "STL / OBJ"} />
            <Metric
              label="Dimensions"
              value={
                uploadedFile
                  ? [
                      formatNumber(uploadedFile.widthMm),
                      formatNumber(uploadedFile.depthMm),
                      formatNumber(uploadedFile.heightMm),
                    ].join(" x ") + " mm"
                  : "Pending analysis"
              }
            />
            <Metric
              label="Mesh"
              value={uploadedFile ? formatNumber(uploadedFile.triangleCount, 0) + " triangles" : "Server verified"}
            />
            <Metric
              label="Volume"
              value={uploadedFile ? formatNumber(uploadedFile.volumeMm3 / 1000) + " cm3" : "Pending analysis"}
              last
            />
          </div>
        </section>

        <aside className="min-w-0 bg-white">
          <div className="divide-y divide-zinc-200">
            <section className="p-5 sm:p-6">
              <SectionTitle number="01" title="Model file" complete={Boolean(file)} />
              <input
                ref={inputRef}
                type="file"
                accept=".stl,.obj"
                className="sr-only"
                onChange={(event) => selectFile(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  selectFile(event.dataTransfer.files[0]);
                }}
                className="flex w-full items-center gap-4 rounded-md border border-dashed border-zinc-300 px-4 py-5 text-left transition hover:border-emerald-600 hover:bg-emerald-50/40"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-zinc-100">
                  <FileUp className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{file?.name ?? "Select model"}</span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    STL or OBJ · {config?.maxFileSizeMb ?? 50} MB max
                  </span>
                </span>
              </button>
            </section>

            <section className="p-5 sm:p-6">
              <SectionTitle number="02" title="Material and color" />
              <div className="grid grid-cols-2 gap-2">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => {
                      setMaterialId(material.id);
                      setColor(material.colors[0] ?? "Black");
                      invalidateQuote();
                    }}
                    className={clsx(
                      "rounded-md border px-3 py-3 text-left transition",
                      selectedMaterial?.id === material.id
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 hover:border-zinc-400",
                    )}
                  >
                    <span className="block text-sm font-bold">{material.name}</span>
                    <span className={clsx("mt-1 block text-[11px]", selectedMaterial?.id === material.id ? "text-zinc-400" : "text-zinc-500")}>
                      {material.densityGramsPerCm3} g/cm3
                    </span>
                  </button>
                ))}
              </div>
              {selectedMaterial && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedMaterial.colors.map((materialColor) => (
                    <button
                      key={materialColor}
                      type="button"
                      onClick={() => {
                        setColor(materialColor);
                        invalidateQuote();
                      }}
                      className={clsx(
                        "h-8 w-8 rounded-full border-2 transition",
                        color === materialColor
                          ? "border-zinc-950 ring-2 ring-zinc-300 ring-offset-2"
                          : "border-zinc-300 hover:scale-105",
                      )}
                      style={{ backgroundColor: COLOR_HEX[materialColor] ?? "#56b8a5" }}
                      aria-label={materialColor}
                      title={materialColor}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="p-5 sm:p-6">
              <SectionTitle number="03" title="Print specification" />
              <div className="grid grid-cols-3 overflow-hidden rounded-md border border-zinc-200">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setQuality(option.value);
                      invalidateQuote();
                    }}
                    className={clsx(
                      "min-w-0 border-r border-zinc-200 px-2 py-3 text-center last:border-r-0",
                      quality === option.value ? "bg-zinc-950 text-white" : "hover:bg-zinc-50",
                    )}
                  >
                    <span className="block text-xs font-bold">{option.label}</span>
                    <span className={clsx("mt-1 block text-[10px]", quality === option.value ? "text-zinc-400" : "text-zinc-500")}>
                      {option.layer}
                    </span>
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="flex items-center justify-between text-xs font-bold">
                  <span>Infill</span>
                  <span>{infillPercent}%</span>
                </span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={infillPercent}
                  onChange={(event) => {
                    setInfillPercent(Number(event.target.value));
                    invalidateQuote();
                  }}
                  className="mt-3 w-full accent-emerald-700"
                />
              </label>

              <div className="mt-5 grid grid-cols-[1fr_132px] gap-3">
                <label className="grid gap-2 text-xs font-bold">
                  Finish
                  <select
                    value={finish}
                    onChange={(event) => {
                      setFinish(event.target.value as PrintFinish);
                      invalidateQuote();
                    }}
                    className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                  >
                    {FINISH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="text-xs font-bold">Quantity</span>
                  <div className="mt-2 grid h-11 grid-cols-[36px_1fr_36px] overflow-hidden rounded-md border border-zinc-300">
                    <button
                      type="button"
                      onClick={() => {
                        setQuantity((value) => Math.max(1, value - 1));
                        invalidateQuote();
                      }}
                      aria-label="Decrease quantity"
                      className="grid place-items-center border-r border-zinc-300 hover:bg-zinc-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="grid place-items-center text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuantity((value) => Math.min(100, value + 1));
                        invalidateQuote();
                      }}
                      aria-label="Increase quantity"
                      className="grid place-items-center border-l border-zinc-300 hover:bg-zinc-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleGetPrice()}
                disabled={isQuoting || configQuery.isLoading || !config?.isEnabled}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {isQuoting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : isAuthenticated ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                {isQuoting
                  ? uploadedFile
                    ? "Calculating..."
                    : "Uploading and analysing..."
                  : isAuthenticated
                    ? "Get instant price"
                    : "Sign in for price"}
              </button>
            </section>

            {quote ? <QuoteSummary quote={quote} /> : <TrustStrip />}

            {quote && (
              <section className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <h2 className="text-lg font-bold">Delivery address</h2>
                </div>

                {addresses.length > 0 && !useNewAddress && (
                  <div className="mt-4 grid gap-2">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={clsx(
                          "cursor-pointer rounded-md border p-3 transition",
                          selectedAddressId === address.id
                            ? "border-emerald-700 bg-emerald-50"
                            : "border-zinc-200 hover:border-zinc-400",
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                        />
                        <span className="block text-sm font-bold">{address.name}</span>
                        <span className="mt-1 block text-xs text-zinc-500">
                          {address.line1}, {address.city}, {address.state} {address.pincode}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {(useNewAddress || addresses.length === 0) && (
                  <AddressFields value={newAddress} onChange={setNewAddress} />
                )}

                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseNewAddress((value) => !value)}
                    className="mt-3 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    {useNewAddress ? "Use a saved address" : "Use a new address"}
                  </button>
                )}

                <label className="mt-5 grid gap-2 text-xs font-bold">
                  Notes
                  <textarea
                    value={customerNotes}
                    onChange={(event) => setCustomerNotes(event.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="resize-none rounded-md border border-zinc-300 p-3 text-sm font-medium outline-none focus:border-zinc-950"
                    placeholder="Tolerance, fit, orientation, or deadline details"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void handlePlaceOrder()}
                  disabled={isOrdering}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-5 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:bg-zinc-300"
                >
                  {isOrdering ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {isOrdering ? "Opening secure payment..." : "Pay " + formatPrice(quote.totalAmountCents)}
                </button>
                <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-semibold text-zinc-500">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Private file</span>
                  <span className="flex items-center gap-1"><LockKeyhole className="h-3.5 w-3.5" /> Zoho Payments</span>
                </div>
              </section>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div className={clsx("min-w-0 px-5 py-4", !last && "border-r border-zinc-800")}>
      <p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function SectionTitle({
  number,
  title,
  complete = false,
}: {
  number: string;
  title: string;
  complete?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-black uppercase text-emerald-700">{number}</p>
        <h2 className="mt-1 text-lg font-bold">{title}</h2>
      </div>
      {complete && <Check className="h-5 w-5 text-emerald-600" />}
    </div>
  );
}

function QuoteSummary({ quote }: { quote: PrintQuote }) {
  return (
    <section className="bg-zinc-50 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase text-emerald-700">Instant quote</p>
          <p className="mt-1 text-3xl font-black">{formatPrice(quote.totalAmountCents)}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-md bg-white ring-1 ring-zinc-200">
          <Weight className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
        <QuoteRow label="Estimated weight" value={formatNumber(quote.totalWeightGrams) + " g"} />
        <QuoteRow label="Print subtotal" value={formatPrice(quote.subtotalCents)} />
        <QuoteRow label="Delivery" value={quote.shippingCents ? formatPrice(quote.shippingCents) : "Free"} />
        <QuoteRow
          label="Production estimate"
          value={quote.estimatedDays + " working days"}
          icon={<Clock3 className="h-4 w-4" />}
        />
      </div>
      <p className="mt-4 text-xs leading-5 text-zinc-500">{quote.disclaimer}</p>
    </section>
  );
}

function QuoteRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <span className="flex items-center gap-2 text-zinc-500">{icon}{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="grid grid-cols-3 divide-x divide-zinc-200 p-0 text-center">
      <TrustItem icon={<FileBox className="h-4 w-4" />} label="Private files" />
      <TrustItem icon={<Weight className="h-4 w-4" />} label="Weight priced" />
      <TrustItem icon={<PackageCheck className="h-4 w-4" />} label="Tracked production" />
    </section>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="px-2 py-5">
      <span className="mx-auto grid place-items-center text-zinc-500">{icon}</span>
      <p className="mt-2 text-[11px] font-bold">{label}</p>
    </div>
  );
}

function AddressFields({
  value,
  onChange,
}: {
  value: typeof EMPTY_ADDRESS;
  onChange: React.Dispatch<React.SetStateAction<typeof EMPTY_ADDRESS>>;
}) {
  const fields = [
    ["name", "Full name"],
    ["phone", "Phone"],
    ["line1", "Address line 1"],
    ["line2", "Address line 2"],
    ["city", "City"],
    ["state", "State"],
    ["pincode", "Pincode"],
    ["country", "Country"],
  ] as const;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {fields.map(([field, label]) => (
        <label
          key={field}
          className={clsx(
            "grid gap-1 text-xs font-bold",
            (field === "line1" || field === "line2") && "col-span-2",
          )}
        >
          {label}
          <input
            value={value[field]}
            onChange={(event) =>
              onChange((current) => ({ ...current, [field]: event.target.value }))
            }
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm font-medium outline-none focus:border-zinc-950"
          />
        </label>
      ))}
    </div>
  );
}
