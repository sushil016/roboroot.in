import Link from "next/link";
import { FileText, Mail, MapPin } from "lucide-react";
import { legalNavigation, type LegalPolicy } from "@/features/legal/data/legal-policies";

export function LegalPolicyPage({ policy }: { policy: LegalPolicy }) {
  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-teal-700">
            <FileText className="h-4 w-4" />
            RoboRoot Legal
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{policy.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{policy.description}</p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
            <div className="flex gap-2"><dt className="font-bold text-slate-800">Last updated</dt><dd>{policy.lastUpdated}</dd></div>
            <div className="flex gap-2"><dt className="font-bold text-slate-800">Version</dt><dd>{policy.version}</dd></div>
            <div className="flex gap-2"><dt className="font-bold text-slate-800">Jurisdiction</dt><dd>{policy.jurisdiction}</dd></div>
          </dl>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <p className="text-xs font-black uppercase text-slate-500">Legal documents</p>
          <nav aria-label="Legal documents" className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
            {legalNavigation.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={item.key === policy.key ? "page" : undefined}
                className={`border-l-2 px-3 py-2 text-sm font-bold transition-colors ${
                  item.key === policy.key
                    ? "border-teal-700 bg-teal-50 text-teal-800"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <article className="divide-y divide-slate-200 border-y border-slate-200">
            {policy.sections.map((section, index) => (
              <section key={section.title} id={`section-${index + 1}`} className="scroll-mt-28 py-8 first:pt-0">
                <div className="flex gap-4">
                  <span className="mt-1 font-mono text-xs font-bold text-teal-700">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black sm:text-2xl">{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-4 text-[15px] leading-7 text-slate-600">{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul className="mt-4 grid gap-2.5 text-[15px] leading-7 text-slate-600">
                        {section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />{bullet}</li>)}
                      </ul>
                    ) : null}
                    {section.groups?.map((group) => (
                      <div key={group.title} className="mt-6 border-l border-slate-300 pl-5">
                        <h3 className="text-base font-black text-slate-900">{group.title}</h3>
                        {group.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-2 text-[15px] leading-7 text-slate-600">{paragraph}</p>)}
                        {group.bullets ? (
                          <ul className="mt-2 grid gap-2 text-[15px] leading-7 text-slate-600">
                            {group.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />{bullet}</li>)}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </article>

          <section className="mt-10 border-t-2 border-teal-700 pt-6">
            <h2 className="text-xl font-black">Questions about this policy?</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:gap-6">
              <a href="mailto:support@roboroot.in" className="inline-flex items-center gap-2 font-bold text-teal-800 hover:underline"><Mail className="h-4 w-4" />support@roboroot.in</a>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />Mumbai, Maharashtra, India</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
