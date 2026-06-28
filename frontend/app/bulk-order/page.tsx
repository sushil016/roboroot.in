"use client";

import { useState } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Truck, 
  Cpu,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState("10-50 units");
  const [requirements, setRequirements] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitted(true);
  }

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
          <div className="lg:col-span-6 space-y-8 self-center">
            <div>
              <h2 className="text-3xl font-extrabold text-[#222222] tracking-tight">RoboRoot Bulk Advantage</h2>
              <p className="text-sm text-zinc-500 mt-2 max-w-md leading-relaxed">
                We handle the procurement details so you can focus on building, teaching, and innovating.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {OFFERS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-[#D8D8C4] rounded-2xl p-5 shadow-xs">
                  <div className="p-2.5 bg-[#1CA2D1]/10 rounded-lg text-[#1CA2D1] w-fit mb-3">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#222222]">{title}</h3>
                  <p className="text-[11px] leading-relaxed text-zinc-500 mt-1.5 font-semibold">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Quote Request Form */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-[#D8D8C4] rounded-3xl p-6 sm:p-8 shadow-xs">
              
              {formSubmitted ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#222222]">Enquiry Submitted</h3>
                    <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting our bulk desk! An account manager will review your parts requirements and email a custom quote within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setName("");
                      setOrg("");
                      setEmail("");
                      setPhone("");
                      setRequirements("");
                    }}
                    className="h-10 px-6 rounded-xl bg-[#222222] text-xs font-bold text-white transition hover:bg-[#1CA2D1] cursor-pointer"
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

                  <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500">Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Sushil Sahani"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500">Institution / Company</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. RoboRoot Labs"
                          value={org}
                          onChange={(e) => setOrg(e.target.value)}
                          className="h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="support@roboroot.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 XXXXX XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Estimated Batch Volume</label>
                      <select
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white cursor-pointer"
                      >
                        <option value="10-50 units">10 - 50 units</option>
                        <option value="50-200 units">50 - 200 units</option>
                        <option value="200+ units">More than 200 units</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Requirements & Parts List</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Please paste your component SKUs/names, quantities, expected dispatch dates, and budget details."
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="p-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="h-11 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mt-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
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
