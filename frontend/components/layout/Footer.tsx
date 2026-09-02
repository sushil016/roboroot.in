/**
 * Footer Component
 * Site-wide footer with links, info, and social media
 */

import Link from 'next/link';
import Image from 'next/image';
import {
  CreditCard,
  Github,
  Landmark,
  Linkedin,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  Twitter,
  WalletCards,
} from 'lucide-react';
import { CookieSettingsButton } from '@/components/ui/cookie-settings-button';

const footerGroups = [
  {
    title: "Quick Links",
    links: [
      ["Browse Components", "/components"],
      ["Browse Categories", "/categories"],
      ["Featured Projects", "/projects"],
      ["STEM Store", "/stem-store"],
      ["3D Printing", "/3d-printing"],
      ["About Us", "/about"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Account",
    links: [
      ["My Orders", "/orders"],
      ["3D Print Orders", "/3d-printing/orders"],
      ["Wishlist", "/wishlist"],
      ["Cart", "/cart"],
      ["Settings", "/settings"],
      ["Profile", "/profile"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Help Center", "/help"],
      ["Submit a Ticket", "/support/new"],
      ["Track a Ticket", "/support/tickets"],

    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Terms & Conditions", "/terms-and-conditions"],
      ["Refund Policy", "/refund-policy"],
      ["Shipping Policy", "/shipping-policy"],
      ["Cancellation Policy", "/cancellation-policy"],
      ["Cookie Policy", "/cookie-policy"],
      ["Disclaimer", "/disclaimer"],
    ],
  },
];

const paymentMethods = [
  { label: "UPI", icon: Smartphone, images: ["/homepage/payment_icons/upi2.png"] },
  { label: "Cards", icon: CreditCard, images: ["/homepage/payment_icons/mastercard.png", "/homepage/payment_icons/visa.png", "/homepage/payment_icons/rupay.png", "/homepage/payment_icons/discover.png"] },
  { label: "Net Banking", icon: Landmark, images: [] },
  { label: "Wallets", icon: WalletCards, images: [] },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950">
      {/* Geometric stepped separator — beige page fades into dark footer */}
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
        height="72"
      >
        <path
          d="M0,0 H1440 V20 L1160,20 L940,52 L0,52 Z"
          fill="#F2F2F0"
        />
      </svg>
      <div className="container mx-auto px-4 pb-12 pt-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/roboroot-logo.png"
                alt="RoboRoot"
                width={140}
                height={38}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-zinc-400">
              Your one-stop destination for robotics components and DIY projects.
              Empowering students and makers to build innovative solutions.
            </p>
            <div className="text-sm text-zinc-400">
              <p className="font-semibold text-[#F2F2F0]">roboroot.in</p>
              <p>Making robotics accessible for everyone</p>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 font-semibold text-[#F2F2F0]">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="footer-link-underline pb-0.5 text-sm text-zinc-400 hover:text-[#F2F2F0] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
                {group.title === "Legal" ? (
                  <li>
                    <CookieSettingsButton className="footer-link-underline pb-0.5 text-left text-sm text-zinc-400 transition-colors hover:text-[#F2F2F0]" />
                  </li>
                ) : null}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-3 font-semibold text-[#F2F2F0]">Connect With Us</h4>
            <div className="flex space-x-3">
              <a href="https://twitter.com/roboroot" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://github.com/roboroot" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com/company/roboroot" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="mailto:support@roboroot.in"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors" aria-label="Email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <section
          aria-labelledby="footer-payment-heading"
          className="mt-10 grid gap-6 border-y border-zinc-800 py-6 lg:grid-cols-[1.15fr_1.5fr_auto] lg:items-center"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-emerald-800/70 bg-emerald-950/50 text-emerald-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 id="footer-payment-heading" className="font-semibold text-[#F2F2F0]">
                Security &amp; payments
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs leading-5 text-zinc-400">
                <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Encrypted checkout. Payment credentials are never stored by us.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
              Accepted methods
            </p>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map(({ label, icon: Icon, images }) => (
                <span
                  key={label}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs font-medium text-zinc-300"
                >
                  <Icon className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                  {label}
                  {images.map((src) => (
                    <Image key={src} src={src} alt="" width={75} height={30} className="h-6 w-auto object-contain" />
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
              Payment partners
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex h-10 items-center gap-2.5 rounded-md border border-zinc-800 px-3 text-zinc-900">
                <div>
                  <Image src="/homepage/payment_icons/zoho.png" alt="Zoho Payments" width={120} height={45} />
                </div>
              </span>
              <span className="inline-flex h-10 items-center gap-2.5 rounded-md border border-zinc-800 px-3 text-zinc-900">
                <div>
                  <Image src="/homepage/payment_icons/razorpay.png" alt="Razorpay" width={120} height={45} />
                </div>
              </span>
            </div>
          </div>
        </section>

        {/* Stepped diagonal divider */}
        <div className="mt-12">
          <svg
            viewBox="0 0 1440 22"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            height="22"
          >
            <path
              d="M0,4 H880 L1100,18 H1440"
              stroke="#3f3f46"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="pt-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-zinc-500">
              © {currentYear} <span className="font-semibold">Roboroot.in</span> is a registered trademark of{" "}
              <span className="font-semibold">ROB0MANIAC TECH LLP</span>. All rights reserved.
            </p>
            <p className="text-sm text-zinc-500">Built with ❤️ for makers and innovators</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
