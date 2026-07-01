"use client";

import { useState, useRef } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  Send, 
  ShieldCheck, 
  Coins, 
  Truck, 
  Cpu,
  CheckCircle2,
  Download,
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import apiClient from "@/lib/api-client";

const OFFERS = [
  {
    icon: Coins,
    title: "Volume Discounts",
    desc: "Get tiered pricing discounts based on quantity for dev boards, sensors, and passive components."
  },
  {
    icon: Cpu,
    title: "Global Custom Sourcing",
    desc: "Can't find a chip, sensor, or motor model locally? We source components directly from verified overseas distributors."
  },
  {
    icon: ShieldCheck,
    title: "Institutional Kit Bundles",
    desc: "Custom lab kits bagged, labeled, and bundled with PDF guides for robotics classes or engineering courses."
  },
  {
    icon: Truck,
    title: "Flexible Priority Shipping",
    desc: "Schedule bulk dispatches on specific dates to match course calendars or company production cycles."
  }
];

export default function BulkOrderPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"csv" | "manual">("csv");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualList, setManualList] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        setCsvFile(file);
        setError(null);
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        setCsvFile(file);
        setError(null);
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  };

  const removeFile = () => {
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!phone.trim()) return setError("Phone number is required");
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.length < 10) {
      return setError("Please enter a valid 10-digit phone number");
    }

    if (activeTab === "csv" && !csvFile) {
      return setError("Please upload a CSV file or switch to Manual Entry");
    }

    if (activeTab === "manual" && !manualList.trim()) {
      return setError("Please enter your parts list in the text area");
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", cleanPhone);
      if (companyName) {
        formData.append("companyName", companyName);
      }

      // Format notes depending on tab
      let finalNotes = notes;
      if (activeTab === "manual") {
        finalNotes = `--- MANUAL PARTS LIST ---\n${manualList}\n\n--- ADDITIONAL NOTES ---\n${notes}`;
      }
      if (finalNotes) {
        formData.append("notes", finalNotes);
      }

      if (activeTab === "csv" && csvFile) {
        formData.append("csvFile", csvFile);
      }

      const response = await apiClient.post("/api/bulk-orders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setFormSubmitted(true);
      } else {
        setError(response.data.error || "Failed to submit request. Please try again.");
      }
    } catch (err: any) {
      console.error("Bulk order submission error:", err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "An error occurred while submitting your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f0] text-[#222222] font-sans pb-16">
      
      {/* Hero Header */}
      <section className="bg-[#222222] rounded-b-[2.5rem] py-16 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold text-[#1CA2D1] tracking-wider uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B & Institutional Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Bulk Orders & Sourcing Services
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Supplying colleges, robotics labs, tech startups, and manufacturing plants with verified components, bulk kit assemblies, and dedicated supply chains.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          
          {/* LEFT — Offers list */}
          <div className="lg:col-span-5 space-y-8 self-center">
            <div>
              <h2 className="text-3xl font-extrabold text-[#222222] tracking-tight">RoboRoot Bulk Advantage</h2>
              <p className="text-sm text-zinc-500 mt-2 max-w-md leading-relaxed">
                We handle the procurement details so you can focus on building, teaching, and innovating.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1">
              {OFFERS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-[#D8D8C4] rounded-2xl p-5 shadow-2xs flex gap-4 items-start">
                  <div className="p-2.5 bg-[#1CA2D1]/10 rounded-xl text-[#1CA2D1] shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#222222]">{title}</h3>
                    <p className="text-xs leading-relaxed text-zinc-500 mt-1 font-semibold">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Quote Request Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#D8D8C4] rounded-3xl p-6 sm:p-8 shadow-xs">
              
              {formSubmitted ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#222222]">Request Submitted!</h3>
                    <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                      Thank you, <span className="font-bold text-zinc-800">{name}</span>. Your bulk quote request has been received. Our B2B representative will review it and get in touch with you shortly.
                    </p>
                  </div>
                  
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 shadow-2xs">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Submission Details</h4>
                    <div className="grid grid-cols-3 text-xs">
                      <span className="text-zinc-500">Contact:</span>
                      <span className="col-span-2 font-bold text-zinc-800">{phone} / {email}</span>
                    </div>
                    {companyName && (
                      <div className="grid grid-cols-3 text-xs">
                        <span className="text-zinc-500">Company:</span>
                        <span className="col-span-2 font-bold text-zinc-800">{companyName}</span>
                      </div>
                    )}
                    {activeTab === "csv" && csvFile && (
                      <div className="grid grid-cols-3 text-xs">
                        <span className="text-zinc-500">BOM File:</span>
                        <span className="col-span-2 font-bold text-zinc-800 flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-[#1CA2D1] shrink-0" />
                          <span className="truncate">{csvFile.name}</span>
                        </span>
                      </div>
                    )}
                    {activeTab === "manual" && (
                      <div className="grid grid-cols-3 text-xs">
                        <span className="text-zinc-500">BOM List:</span>
                        <span className="col-span-2 font-bold text-zinc-800">
                          {manualList.split("\n").filter(Boolean).length} items listed
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setName("");
                      setCompanyName("");
                      setEmail("");
                      setPhone("");
                      setNotes("");
                      setCsvFile(null);
                      setManualList("");
                      setError(null);
                    }}
                    className="h-11 px-8 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-[#222222]">Request a Custom Quote</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-bold uppercase tracking-wide">
                      Submit your parts lists and estimated quantities below
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="grid gap-5">
                    {/* Basic Info Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500">Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Sushil Sahani"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11 px-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500">Institution / Company (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. RoboRoot Labs"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="h-11 px-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Contact Info Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="support@roboroot.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 px-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 relative">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-500">Phone Number (Priority)</label>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-200 shadow-3xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            WhatsApp Active
                          </span>
                        </div>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-sm font-bold text-zinc-400 border-r border-zinc-200 pr-2">+91</span>
                          <input
                            type="tel"
                            required
                            placeholder="98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-11 pl-14 pr-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20 transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          We will contact you on this number via WhatsApp/Call for instant negotiation.
                        </p>
                      </div>
                    </div>

                    {/* Toggle Tabs */}
                    <div className="mt-2">
                      <div className="flex border-b border-zinc-200 mb-5">
                        <button
                          type="button"
                          onClick={() => { setActiveTab("csv"); setError(null); }}
                          className={`flex-1 pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
                            activeTab === "csv" 
                              ? "border-[#1CA2D1] text-[#1CA2D1]" 
                              : "border-transparent text-zinc-400 hover:text-zinc-600"
                          }`}
                        >
                          Upload CSV File
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveTab("manual"); setError(null); }}
                          className={`flex-1 pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
                            activeTab === "manual" 
                              ? "border-[#1CA2D1] text-[#1CA2D1]" 
                              : "border-transparent text-zinc-400 hover:text-zinc-600"
                          }`}
                        >
                          Enter List Manually
                        </button>
                      </div>

                      {/* Tab Content 1: CSV Upload */}
                      {activeTab === "csv" && (
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500">Upload your Bill of Materials (BOM)</span>
                            <a 
                              href="/sample-bulk-template.csv" 
                              download="sample-bulk-template.csv"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1CA2D1] hover:underline"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Template
                            </a>
                          </div>
                          
                          <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                              dragActive 
                                ? "border-[#1CA2D1] bg-[#1CA2D1]/5 scale-[0.99]" 
                                : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-400"
                            }`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".csv"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            
                            {csvFile ? (
                              <div className="space-y-3 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                                <div className="p-3 bg-zinc-100 rounded-xl flex items-center justify-between border border-zinc-200">
                                  <div className="flex items-center gap-2 text-left truncate">
                                    <FileText className="w-8 h-8 text-[#1CA2D1] shrink-0" />
                                    <div className="truncate">
                                      <p className="text-xs font-bold text-zinc-700 truncate">{csvFile.name}</p>
                                      <p className="text-[10px] text-zinc-400 font-medium">
                                        {(csvFile.size / 1024).toFixed(1)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={removeFile}
                                    className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-zinc-600 transition"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="p-3 bg-white rounded-xl shadow-xs border border-zinc-200 text-[#1CA2D1] mb-2.5">
                                  <UploadCloud className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-zinc-700">Drag & drop your CSV file here</p>
                                <p className="text-[10px] text-zinc-400 mt-1 font-semibold">or click to browse from your device</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tab Content 2: Manual Text */}
                      {activeTab === "manual" && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-zinc-500">Paste your components list</label>
                          <textarea
                            required={activeTab === "manual"}
                            rows={5}
                            placeholder="e.g.&#10;10 x Arduino Uno R3&#10;50 x SG90 Servo Motors&#10;20 x HC-SR04 Ultrasonic Sensors"
                            value={manualList}
                            onChange={(e) => setManualList(e.target.value)}
                            className="p-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20 transition-all placeholder:text-zinc-400"
                          />
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            List item names and quantities clearly. One item per line is preferred.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Additional Notes */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Additional Instructions / Requirements (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Expected delivery dates, specific brand preferences, target pricing, or other special requirements."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="p-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] disabled:bg-zinc-400 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2 w-full active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Quote Request</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
