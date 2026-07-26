"use client";

import { useState } from "react";
import { 
  Users, 
  Send, 
  Cpu, 
  GraduationCap, 
  Rocket,
  CheckCircle2,
  X,
  Briefcase,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";

const CULTURE = [
  {
    icon: Rocket,
    title: "Maker First",
    desc: "We are an office of hackers and tinkerers. You'll work directly with oscilloscopes, 3D printers, and soldering stations."
  },
  {
    icon: Cpu,
    title: "Technical Verifiers",
    desc: "We verify every component before shipping, which requires deep hardware component knowledge and testing loops."
  },
  {
    icon: GraduationCap,
    title: "STEM Educators",
    desc: "We build Lego robotics kits, AI textbooks, and course curriculums that form the basis of science labs across the country."
  }
];

export default function CareersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [letter, setLetter] = useState("");

  async function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/api/careers/apply", {
        name,
        email,
        phone,
        portfolioUrl: portfolio,
        coverLetter: letter,
      });

      if (response.data?.success) {
        setApplied(true);
      } else {
        setError(response.data?.error || "Failed to submit application.");
      }
    } catch (err: any) {
      console.error("Career application submit error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "An error occurred while submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] text-[#222222] font-sans pb-16">
      
      {/* Hero Header */}
      <section className="bg-[#222222] rounded-b-[2.5rem] py-16 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold text-[#1CA2D1] tracking-wider uppercase">
            <Users className="w-3.5 h-3.5" />
            <span>Join Our Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Build the Future of Hardware
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            We are always looking for passionate makers, embedded developers, and hardware specialists to join our labs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        
        {/* Culture Row */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#222222]">Life at RoboRoot</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Our Core Culture</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {CULTURE.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#D2D2D0] rounded-2xl p-6 shadow-xs">
                <div className="p-3 bg-[#1CA2D1]/10 rounded-xl text-[#1CA2D1] w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[#222222]">{title}</h3>
                <p className="text-xs leading-relaxed text-zinc-500 mt-2 font-semibold">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Speculative Application Block */}
        <section className="max-w-3xl mx-auto bg-white border border-[#D2D2D0] rounded-3xl p-8 shadow-xs text-center space-y-6">
          <div className="w-14 h-14 bg-[#1CA2D1]/10 rounded-full flex items-center justify-center mx-auto text-[#1CA2D1]">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#222222]">Speculative Application</h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">
              We are constantly seeking smart engineering talent, hardware designers, and operations specialists. Tell us about your background and what you are building.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-xs"
          >
            Submit Application
          </button>
        </section>

      </div>

      {/* Application Popup Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-[#D2D2D0] rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-zinc-100 transition text-zinc-400 hover:text-[#222222] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {applied ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[#222222]">Application Received!</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Thank you for applying to join the RoboRoot team. A confirmation email has been sent to your inbox.
                </p>
                <button
                  onClick={() => {
                    setApplied(false);
                    setModalOpen(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setPortfolio("");
                    setLetter("");
                    setError(null);
                  }}
                  className="h-10 px-6 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition mt-2 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#222222]">Speculative Application</h3>
                  <p className="text-xs text-[#1CA2D1] font-bold mt-1 uppercase tracking-wide">
                    RoboRoot Engineering & Sourcing Labs
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleApplySubmit} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">Full Name</label>
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
                      <label className="text-xs font-bold text-zinc-500">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="hiring@roboroot.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-500">GitHub / LinkedIn URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://linkedin.com/in/username"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        className="h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500">Cover Letter & Pitch Summary</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us about yourself and the projects you've built."
                      value={letter}
                      onChange={(e) => setLetter(e.target.value)}
                      className="p-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] disabled:bg-zinc-400 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
