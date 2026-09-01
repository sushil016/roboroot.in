/**
 * Footer Component
 * Site-wide footer with links, info, and social media
 */

import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const footerGroups = [
  {
    title: "Quick Links",
    links: [
      ["Browse Components", "/components"],
      ["Browse Categories", "/categories"],
      ["Featured Projects", "/projects"],
      ["STEM Store", "/stem-store"],
      ["About Us", "/about"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Account",
    links: [
      ["My Orders", "/orders"],
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
      ["Shipping Info", "/shipping"],
      ["Returns & Refunds", "/returns"],
      ["FAQs", "/faq"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
      ["Refund Policy", "/refund-policy"],
    ],
  },
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
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
              </ul>
            </div>
          ))}

          <div className="md:col-start-5">
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
            <p className="text-sm text-zinc-500">© {currentYear} RoboRoot. All rights reserved.</p>
            <p className="text-sm text-zinc-500">Built with ❤️ for makers and innovators</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
