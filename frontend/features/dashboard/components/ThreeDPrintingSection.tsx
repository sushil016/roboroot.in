import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Box,
  FileUp,
  Layers3,
  ScanLine,
  Weight,
} from "lucide-react";

const servicePoints = [
  { label: "STL & OBJ preview", icon: ScanLine },
  { label: "Material choices", icon: Layers3 },
  { label: "Weight-based quote", icon: Weight },
];

export function ThreeDPrintingSection() {
  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800">
            <Box className="h-4 w-4" aria-hidden="true" />
            3D printing service
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-zinc-950 sm:text-4xl">
            Turn your 3D model into a real part.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Preview your design, choose the material and finish, and get an instant
            production price before placing an order.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {servicePoints.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                <Icon className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>

          <Link
            href="/3d-printing"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-zinc-950 px-6 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Upload a model
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <Link
          href="/3d-printing"
          aria-label="Open the 3D printing studio"
          className="group relative min-h-[360px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 text-white transition hover:border-emerald-600 sm:min-h-[420px]"
        >
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "linear-gradient(rgba(113,113,122,.34) 1px, transparent 1px), linear-gradient(90deg, rgba(113,113,122,.34) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-5 py-4">
            <span className="text-xs font-bold uppercase text-zinc-400">Model workspace</span>
            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              Instant preview
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-[65px] top-[57px] grid grid-cols-[0.9fr_1.1fr]">
            <div className="relative z-10 flex items-center px-5 sm:px-8">
              <div className="max-w-[230px] text-left">
              <span className="grid h-14 w-14 place-items-center rounded-md border border-zinc-700 bg-zinc-900 transition group-hover:border-emerald-600 group-hover:text-emerald-400 sm:h-16 sm:w-16">
                <FileUp className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-5 text-lg font-bold sm:text-xl">Upload STL or OBJ</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400 sm:text-sm">Preview, configure, and price your part.</p>
              </div>
            </div>

            <div className="relative min-w-0 overflow-hidden">
              <Image
                src="/homepage/3dprinter.png"
                alt="Bambu Lab 3D printer"
                fill
                sizes="(min-width: 1280px) 340px, (min-width: 1024px) 28vw, 50vw"
                className="object-contain object-bottom transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-transparent" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 divide-x divide-zinc-800 border-t border-zinc-800 bg-zinc-950/95 text-center">
            <PreviewMetric label="Files" value="Private" />
            <PreviewMetric label="Quote" value="Instant" />
            <PreviewMetric label="Production" value="Tracked" />
          </div>
        </Link>
      </div>
    </section>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-4">
      <p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
