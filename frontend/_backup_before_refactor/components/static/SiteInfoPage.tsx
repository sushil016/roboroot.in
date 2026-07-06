type SiteInfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: {
    title: string;
    body: string;
  }[];
};

export function SiteInfoPage({ eyebrow, title, description, sections }: SiteInfoPageProps) {
  return (
    <div className="bg-[#F2F2F0] text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black">{title}</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">{description}</p>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-slate-200 bg-[#F2F2F0] p-5 shadow-sm">
              <h2 className="text-2xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
