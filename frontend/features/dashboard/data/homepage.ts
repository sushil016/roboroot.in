// Static UI content for the homepage.
// Product, category, and project data is fetched from the API — not stored here.

export type HomeIconName =
  | "battery"
  | "boxes"
  | "brain"
  | "cpu"
  | "factory"
  | "film"
  | "gauge"
  | "graduation"
  | "microscope"
  | "package"
  | "plane"
  | "radar"
  | "rocket"
  | "shield"
  | "sparkles"
  | "store"
  | "wrench";

export const homeHero = {
  eyebrow: "B2C and B2B electronics builds",
  title: "Complete robotics, IoT, drone, and AI project builds.",
  description:
    "Buy electronics parts, course kits, STEM books, BlockSquare software, or get a custom hardware-software project built for student, institution, or company needs.",
  image: "/homepage/components.png",
  primaryCta: { label: "Browse All Categories", href: "/categories" },
  secondaryCta: { label: "Custom Project Services", href: "/projects" },
};

export const serviceTiles = [
  {
    title: "All Electronics",
    copy: "Small parts to complete assemblies",
    href: "/categories",
    icon: "cpu",
    tone: "bg-blue-50 text-blue-800",
  },
  {
    title: "Custom Projects",
    copy: "Student, institution, and company builds",
    href: "/projects",
    icon: "brain",
    tone: "bg-cyan-50 text-cyan-800",
  },
  {
    title: "STEM Store",
    copy: "Kits, books, and Lego",
    href: "/stem-store",
    icon: "store",
    tone: "bg-sky-50 text-sky-800",
  },
  {
    title: "Drones & Aero",
    copy: "UAV, satellite, and aero models",
    href: "/components?category=Drones%20%26%20Aerospace",
    icon: "plane",
    tone: "bg-indigo-50 text-indigo-800",
  },
] satisfies Array<{
  title: string;
  copy: string;
  href: string;
  icon: HomeIconName;
  tone: string;
}>;

export const services = [
  {
    title: "Electronics Components",
    copy: "Small passives, semiconductors, modules, displays, tools, and full assemblies.",
    icon: "cpu",
  },
  {
    title: "Student Projects",
    copy: "Final year, competition, science fair, prototype, and research builds.",
    icon: "graduation",
  },
  {
    title: "Institution Labs",
    copy: "Robotics, IoT, AI, drone, and electronics lab kits for schools and colleges.",
    icon: "factory",
  },
  {
    title: "Company Prototypes",
    copy: "B2B hardware, firmware, IoT dashboards, automation, and custom devices.",
    icon: "brain",
  },
  {
    title: "Aerospace Builds",
    copy: "Drones, satellite models, payload prototypes, and aero modeling planes.",
    icon: "rocket",
  },
  {
    title: "IoT Systems",
    copy: "Sensor networks, dashboards, automation, telemetry, and connected devices.",
    icon: "radar",
  },
  {
    title: "Robotics Programs",
    copy: "Robotics labs, training kits, course kits, robot builds, and BOM planning.",
    icon: "wrench",
  },
  {
    title: "PCB & Manufacturing",
    copy: "PCB support, prototyping, assembly planning, and product-ready electronics.",
    icon: "microscope",
  },
  {
    title: "STEM Store Products",
    copy: "Lego robotics kits, robotics course kits, AI books, and BlockSquare software.",
    icon: "store",
  },
] satisfies Array<{
  title: string;
  copy: string;
  icon: HomeIconName;
}>;

export const projectVideoSlots = [
  "Robotics project demos",
  "IoT and automation walkthroughs",
  "Drone and aero modeling tests",
];
