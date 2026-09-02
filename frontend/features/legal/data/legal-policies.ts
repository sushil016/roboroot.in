import { LEGAL_LAST_UPDATED, LEGAL_POLICY_LINKS, LEGAL_POLICY_VERSION } from "@/features/legal/constants";

export type LegalPolicyKey =
  | "privacyPolicy"
  | "termsAndConditions"
  | "refundPolicy"
  | "shippingPolicy"
  | "cancellationPolicy"
  | "cookiePolicy"
  | "disclaimer";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  groups?: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
};

export type LegalPolicy = {
  key: LegalPolicyKey;
  title: string;
  shortTitle: string;
  description: string;
  lastUpdated: string;
  version: string;
  jurisdiction: string;
  sections: LegalSection[];
};

const shared = {
  lastUpdated: LEGAL_LAST_UPDATED,
  version: LEGAL_POLICY_VERSION,
  jurisdiction: "Mumbai, Maharashtra, India",
};

export const legalPolicies: Record<LegalPolicyKey, LegalPolicy> = {
  termsAndConditions: {
    ...shared,
    key: "termsAndConditions",
    title: "Terms and Conditions",
    shortTitle: "Terms",
    description: "The rules that apply when you access RoboRoot, create an account, or purchase products and services.",
    sections: [
      {
        title: "Agreement to Terms and Conditions",
        paragraphs: [
          "By accessing, browsing, and using www.roboroot.in and all associated services, applications, and content provided by ROB0MANIAC TECH LLP, a Limited Liability Partnership registered under the Limited Liability Partnership Act, 2008, with its registered office in Mumbai, Maharashtra, India (the Company, we, our, or us), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. These Terms apply to all users, including browsers, vendors, customers, merchants, and content contributors.",
          "If you do not agree to these Terms, please do not use the Website or its services. We may update, change, or replace any part of these Terms. Your continued use after revised Terms are posted constitutes acceptance of those changes.",
        ],
      },
      {
        title: "Definition of Terms",
        bullets: [
          "User means any individual or entity accessing the Website.",
          "Customer means a User who purchases products or services from the Website.",
          "Products means goods offered for sale on the Website.",
          "Services means services provided by the Company through the Website.",
          "Personal Information means information that identifies or can be used to identify a User.",
          "Website means www.roboroot.in, its pages, subdomains, and associated services.",
        ],
      },
      {
        title: "Use License and Restrictions",
        paragraphs: ["We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Website for lawful purposes only. You may not:"],
        bullets: [
          "Modify, reproduce, or create derivative works from Website content.",
          "Use the Website or its content commercially without express written consent.",
          "Decompile, disassemble, or reverse engineer Website software or technology.",
          "Remove or alter copyright notices, trademarks, or proprietary notations.",
          "Transfer, sublicense, or assign rights granted under this license.",
          "Upload or distribute unlawful, defamatory, obscene, or rights-infringing content.",
          "Disrupt or inhibit another person's use of the Website.",
          "Use bots, scrapers, or similar automated tools without permission.",
          "Attempt unauthorized access to any part of the Website.",
        ],
      },
      {
        title: "User Accounts and Registration",
        paragraphs: [
          "When you create an account, you are responsible for keeping your login credentials confidential and for activity under your account. You must provide accurate, complete, and current registration information. False information and impersonation are prohibited.",
          "We may suspend or terminate accounts that violate these Terms or are connected to unauthorized or fraudulent activity.",
        ],
      },
      {
        title: "Product Descriptions and Pricing",
        paragraphs: ["We work to provide accurate descriptions, specifications, images, and prices, but do not warrant that all product content is error-free, complete, or current. Images are illustrative and actual products may vary due to manufacturing, photography, or lighting."],
        bullets: [
          "We may correct pricing errors without liability.",
          "We may change product specifications or features.",
          "We may refuse an order or service request.",
          "We may limit quantities ordered by a customer.",
        ],
      },
      {
        title: "Payment Terms",
        paragraphs: [
          "Prices are quoted in Indian Rupees unless stated otherwise. Available payment methods are shown at checkout and may include cards, UPI, digital wallets, and net banking. By submitting payment, you authorize the stated amount to be charged through the selected provider.",
          "You are responsible for applicable taxes, including GST. Taxes are calculated or displayed at checkout as required. Orders are not processed when payment is declined or unauthorized, and we may cancel an order if payment cannot be verified or fraud indicators are detected.",
        ],
      },
      {
        title: "Disclaimers and Warranties",
        paragraphs: ["To the maximum extent permitted by law, the Website, information, Products, and Services are provided on an as-is and as-available basis."],
        bullets: [
          "We disclaim express and implied warranties, including merchantability, fitness for a particular purpose, accuracy, non-infringement, and title.",
          "We do not warrant uninterrupted, error-free, secure, or virus-free operation.",
          "We do not guarantee that defects will be corrected or that every device or browser will be compatible.",
          "Products are sold as-is unless a separate warranty is expressly specified.",
        ],
      },
      {
        title: "Limitation of Liability",
        paragraphs: ["To the maximum extent permitted by Indian law, ROB0MANIAC TECH LLP and its directors, officers, employees, agents, and representatives will not be liable for:"],
        bullets: [
          "Indirect, incidental, special, or consequential damages.",
          "Lost profits, revenue, data, or business opportunities.",
          "Business interruption or damage to reputation and goodwill.",
          "Damage arising from unauthorized access to or alteration of transmissions.",
        ],
      },
      {
        title: "Governing Law and Jurisdiction",
        paragraphs: [
          "These Terms are governed by the laws of India and the laws applicable in Maharashtra. Courts located in Mumbai, Maharashtra have exclusive jurisdiction over disputes arising from the Website, these Terms, or your use of the Website.",
          "You submit to the exclusive jurisdiction of those courts and waive objections based on venue or inconvenient forum.",
        ],
      },
      {
        title: "Third-Party Links and Content",
        paragraphs: ["The Website may link to services not operated by us. We are not responsible for their content, accuracy, legality, availability, or practices. A link does not imply endorsement, and your use of third-party services is governed by their own terms and privacy policies."],
      },
      {
        title: "Severability",
        paragraphs: ["If a provision is invalid or unenforceable under Indian law, it will be modified only as much as necessary to become enforceable or otherwise severed. Remaining provisions continue in full force."],
      },
      {
        title: "Entire Agreement",
        paragraphs: ["These Terms, together with the Privacy Policy, Refund Policy, Shipping Policy, Cancellation Policy, and other posted policies, form the entire agreement concerning use of the Website and supersede prior or contemporaneous understandings."],
      },
    ],
  },
  privacyPolicy: {
    ...shared,
    key: "privacyPolicy",
    title: "Privacy Policy",
    shortTitle: "Privacy",
    description: "How RoboRoot collects, uses, shares, retains, and protects personal information.",
    sections: [
      {
        title: "Introduction and Scope",
        paragraphs: [
          "ROB0MANIAC TECH LLP (the Company, we, our, or us) is committed to protecting your privacy. This policy explains how we collect, use, disclose, retain, and safeguard information when you use www.roboroot.in and our services.",
          "This policy is governed by applicable Indian data protection law, including the Information Technology Act, 2000 and associated rules. If you do not agree with these practices, please do not use the Website.",
        ],
      },
      {
        title: "Information We Collect",
        groups: [
          {
            title: "Information you provide",
            bullets: [
              "Name, email address, phone number, and postal address.",
              "Billing and shipping addresses and delivery instructions.",
              "Date of birth if required for age verification.",
              "Payment information handled through payment providers.",
              "KYC documentation if required by an applicable service or law.",
              "Purchase history, preferences, feedback, reviews, and correspondence.",
            ],
          },
          {
            title: "Information collected automatically",
            bullets: [
              "IP address, browser, operating system, device identifiers, and user agent.",
              "Pages visited, time on pages, click patterns, referral source, and exit pages.",
              "Geolocation data where you grant permission.",
              "Cookies, local storage, and similar technologies.",
              "Search queries, transaction history, and consent audit events.",
            ],
          },
        ],
      },
      {
        title: "Legal Basis for Processing",
        bullets: [
          "Contractual necessity to provide requested products and services.",
          "Legal compliance, including tax, accounting, and regulatory obligations.",
          "Legitimate interests such as security, fraud prevention, and service improvement.",
          "Consent for processing choices that depend on your permission; consent may be withdrawn where applicable.",
        ],
      },
      {
        title: "How We Use Information",
        groups: [
          { title: "Orders", bullets: ["Process and fulfil purchases.", "Send order, shipping, and delivery updates.", "Manage returns, cancellations, and refunds."] },
          { title: "Communication", bullets: ["Respond to support requests.", "Send important service messages.", "Send promotional messages only where appropriate consent exists."] },
          { title: "Accounts and experience", bullets: ["Create and maintain accounts.", "Verify identity and secure access.", "Improve Website functionality and user experience."] },
          { title: "Analytics and security", bullets: ["Understand traffic and preferences.", "Detect fraud and security threats.", "Maintain records required by law."] },
        ],
      },
      {
        title: "Disclosure of Personal Information",
        groups: [
          { title: "Service providers", paragraphs: ["We share information with providers that support payments, shipping, customer service, hosting, security, and analytics. They may use it only to provide contracted services and must protect confidentiality."] },
          { title: "Legal requirements", paragraphs: ["We may disclose information to comply with court orders, legal process, tax and regulatory duties, enforce policies, or protect rights, property, and safety."] },
          { title: "Business transfers", paragraphs: ["Information may transfer in a merger, acquisition, insolvency, restructuring, or asset sale. We will provide notice before it becomes subject to a materially different privacy policy."] },
          { title: "With your consent", paragraphs: ["We may share information with another party when you explicitly authorize that sharing."] },
        ],
      },
      {
        title: "Data Retention",
        bullets: [
          "Transaction and order data: at least 5 years where required for tax and audit purposes.",
          "Account information: while the account is active and afterward where law or dispute needs require.",
          "Communication records: generally 2 years for support and dispute resolution.",
          "Analytics data: generally 1 to 3 years depending on the analysis purpose.",
          "Consent records: retained as needed to demonstrate your choices, comply with law, and resolve disputes.",
        ],
      },
      {
        title: "Security Measures",
        paragraphs: ["We use commercially reasonable administrative, technical, and organizational controls. No internet transmission or storage system is completely secure, so absolute security cannot be guaranteed."],
        bullets: [
          "Encrypted transport for Website data.",
          "Secure payment gateway integration.",
          "Security reviews, access controls, and role-based permissions.",
          "Firewalls, monitoring, and staff data-protection practices.",
        ],
      },
      {
        title: "Your Privacy Rights",
        paragraphs: ["Subject to applicable law, you may contact support@roboroot.in to exercise these rights. We may request identification before completing a request."],
        bullets: [
          "Access personal information held about you.",
          "Correct inaccurate or incomplete information.",
          "Request deletion, subject to retention obligations.",
          "Opt out of marketing communications.",
          "Request information in a portable format where applicable.",
        ],
      },
      {
        title: "Consent and Policy Records",
        paragraphs: ["When you accept policies during registration, sign-in, checkout, or adjust cookie preferences, we keep an audit record. It may include your account or anonymous consent identifier, accepted policy version, selected preferences, source screen, timestamp, order reference, IP address, and browser user agent. Administrators can access these records for compliance, support, and dispute resolution."],
      },
      {
        title: "Cookies and Tracking Technologies",
        paragraphs: ["We use essential cookies for login, payment, security, and session management. Optional preference, analytics, and marketing technologies are controlled through the cookie preference panel. See the Cookie Policy for details."],
      },
      {
        title: "Third-Party Links",
        paragraphs: ["We are not responsible for external websites' privacy practices. Review their policies before providing personal information."],
      },
      {
        title: "Children's Privacy",
        paragraphs: ["The Website is not intended for children under 18. We do not knowingly collect a child's personal information without appropriate authorization. If we learn that such information was collected improperly, we will take steps to delete it."],
      },
      {
        title: "Contact Us",
        paragraphs: ["For privacy questions or rights requests, email support@roboroot.in. Registered office: Mumbai, Maharashtra, India."],
      },
    ],
  },
  refundPolicy: {
    ...shared,
    key: "refundPolicy",
    title: "Refund and Return Policy",
    shortTitle: "Refunds",
    description: "Eligibility, return steps, inspection, and refund timelines for RoboRoot purchases.",
    sections: [
      {
        title: "Returns Eligibility and Timeframe",
        paragraphs: ["In accordance with applicable Indian consumer law, eligible products may be returned within 7 days of delivery when they meet all conditions below."],
        bullets: ["Unused and in original condition.", "Original packaging intact with all accessories.", "No signs of wear, damage, or tampering.", "Original labels and tags attached.", "Valid proof of purchase."],
      },
      {
        title: "Return Procedure",
        groups: [
          { title: "1. Request", bullets: ["Email support@roboroot.in within 7 days of delivery.", "Include the order number, reason, product condition, and photographs."] },
          { title: "2. Authorization", bullets: ["We review requests within 48 hours.", "Approved requests receive return instructions and a Return Authorization Number (RAN)."] },
          { title: "3. Shipping", bullets: ["Pack the item securely in its original packaging.", "Include the RAN and ship to the address supplied by support."] },
          { title: "4. Inspection", bullets: ["We inspect the returned product after receipt.", "Verification is generally completed within 5 to 7 business days."] },
        ],
      },
      {
        title: "Refund Processing",
        bullets: [
          "Approved refunds are initiated within 5 to 7 business days after inspection.",
          "Refunds are sent to the original payment method.",
          "Banks and payment providers may require another 5 to 10 business days.",
          "GST is refunded in accordance with the original invoice and applicable law.",
        ],
      },
      {
        title: "Return Shipping",
        groups: [
          { title: "Customer-paid returns", bullets: ["Change of mind or unmet personal expectations.", "Damage caused by misuse or neglect.", "Missing or non-original packaging."] },
          { title: "Company-paid returns", bullets: ["Defective or damaged goods.", "Items that materially do not match their description.", "Manufacturing defects.", "An incorrect item was shipped."] },
        ],
      },
      {
        title: "Non-Returnable Items",
        bullets: [
          "Customized, personalized, or made-to-order products.",
          "Items with missing or removed serial numbers or holograms.",
          "Products showing use, wear, alteration, or customer-caused damage.",
          "Items returned more than 7 days after delivery.",
          "Clearance, discontinued, or final-sale items.",
          "Items without original packaging or tags.",
        ],
      },
      {
        title: "Defective Products and Warranty",
        paragraphs: ["Report a defective, damaged, or malfunctioning item to support@roboroot.in within 48 hours of delivery. Include order details, photos, and a description, and do not use or alter the item."],
        bullets: ["After verification, we may provide a replacement or full refund.", "Approved defective-item returns include original shipping and prepaid return shipping.", "No additional return charge applies to a verified defect or fulfilment error."],
      },
      {
        title: "Condition and Inspection",
        paragraphs: ["Returned items are inspected. A return may be rejected or reduced by actual repair or refurbishment cost when the condition does not meet this policy or shows handling beyond what is reasonably necessary to inspect the product."],
      },
      {
        title: "Special Circumstances",
        groups: [
          { title: "International returns", paragraphs: ["Customers are responsible for customs fees and import duties connected with an international return."] },
          { title: "Bulk orders", paragraphs: ["Wholesale and bulk returns may have separate agreed terms. Contact support@roboroot.in before returning them."] },
        ],
      },
    ],
  },
  shippingPolicy: {
    ...shared,
    key: "shippingPolicy",
    title: "Shipping Policy",
    shortTitle: "Shipping",
    description: "Delivery options, processing, tracking, costs, and exceptions for RoboRoot orders.",
    sections: [
      {
        title: "Shipping Methods and Timelines",
        groups: [
          { title: "Domestic standard shipping", bullets: ["Typical delivery: 5 to 7 business days.", "Coverage: major cities and serviceable locations in India.", "Charges and any free-delivery threshold are shown at checkout."] },
          { title: "Domestic express shipping", bullets: ["Typical delivery: 2 to 3 business days where available.", "Additional charges apply and are shown before payment."] },
          { title: "International shipping", bullets: ["Typical delivery: 10 to 21 business days, depending on destination.", "Availability and cost are displayed at checkout where supported."] },
        ],
      },
      {
        title: "Shipping Cost Calculation",
        paragraphs: ["Shipping cost may depend on destination, total or dimensional weight, product dimensions, selected service, courier rates, and configured order-value tiers. Applicable GST is added as required. The final charge and any free-shipping threshold are displayed before checkout."],
      },
      {
        title: "Order Processing",
        paragraphs: ["Orders are generally processed within 1 to 2 business days, excluding weekends and public holidays."],
        bullets: ["Payment and fraud verification.", "Picking and packing.", "Quality and accuracy checks.", "Handover to the courier partner."],
      },
      {
        title: "Tracking and Notifications",
        bullets: ["Shipping confirmation with a tracking number when available.", "Courier details and estimated delivery date.", "Tracking link through RoboRoot or the delivery partner.", "Delivery updates by email or SMS where enabled."],
      },
      {
        title: "Shipping Address",
        bullets: ["Provide a complete street address, house or unit number, city, state, and postal code.", "Avoid P.O. boxes where courier delivery is unavailable.", "Provide a reachable phone number and any necessary access instructions.", "We are not responsible for failed or incorrect delivery caused by an address entered incorrectly by the customer."],
      },
      {
        title: "Delivery Exceptions and Delays",
        paragraphs: ["Weather, disasters, emergencies, strikes, holidays, customs, courier disruptions, and address-access problems may affect estimates. When possible, we will share a revised estimate."],
      },
      {
        title: "Lost or Damaged Shipments",
        paragraphs: ["Report a lost shipment or visible delivery damage within 48 hours, with the order number, tracking details, photos, and original packaging. After verification with the courier, we will arrange an appropriate replacement or refund without additional product charge."],
      },
      {
        title: "Refused or Undelivered Packages",
        paragraphs: ["A refused or undeliverable package may be returned to our warehouse. Any eligible refund is processed after receipt and inspection, generally within 5 to 7 business days. Original shipping charges are not refundable unless law or this policy requires otherwise."],
      },
      {
        title: "International Shipping Details",
        bullets: ["Customers are responsible for customs duties and import taxes.", "Customs review may delay delivery.", "Inspection or additional documentation may be required.", "Some products cannot be shipped to certain countries."],
      },
      {
        title: "Free Shipping Terms",
        paragraphs: ["Any free-delivery threshold, eligible shipping method, geography, and exclusions are shown at checkout and may be changed through store delivery settings. Free standard delivery does not automatically include express or international shipping."],
      },
    ],
  },
  cancellationPolicy: {
    ...shared,
    key: "cancellationPolicy",
    title: "Cancellation Policy",
    shortTitle: "Cancellation",
    description: "When and how an order can be cancelled before dispatch.",
    sections: [
      { title: "Cancellation Window", paragraphs: ["An order may be cancelled within 24 hours of placement if it has not been dispatched. After 24 hours or once shipping begins, cancellation is unavailable, but an eligible product may still follow the return process."] },
      { title: "How to Cancel", bullets: ["Email support@roboroot.in with the subject Order Cancellation Request.", "Include the order number, reason, customer name, and registered email.", "We generally respond within 24 hours with the cancellation status."] },
      { title: "Approval and Refund", bullets: ["An approved cancellation is refunded within 5 to 7 business days.", "The product price and applicable GST are included.", "Original shipping charges are not refunded unless required by law.", "The refund is sent to the original payment method.", "Your bank or card issuer may require another 5 to 10 business days."] },
      { title: "Orders Already Shipped", bullets: ["A dispatched order cannot be cancelled.", "You may refuse delivery where the courier permits it.", "Alternatively, use the eligible return process within 7 days of delivery."] },
      { title: "Partial Cancellations", paragraphs: ["You may request cancellation of selected items in a multi-item order only while those items have not been processed or dispatched. Include the item details in your request."] },
      { title: "Pre-Orders and Special Orders", bullets: ["Pre-orders may be cancelled up to 48 hours before the stated release date.", "Custom or personalized items cannot be cancelled after production begins.", "Bulk orders may have separate agreed cancellation terms."] },
      { title: "Reasons a Request May Be Denied", bullets: ["The order has shipped or is out for delivery.", "More than 24 hours have passed.", "Production has begun on a custom item.", "A pre-order is within 48 hours of release.", "There is clear evidence of fraudulent activity."] },
    ],
  },
  disclaimer: {
    ...shared,
    key: "disclaimer",
    title: "Disclaimer",
    shortTitle: "Disclaimer",
    description: "Important limitations concerning Website content, products, services, and third parties.",
    sections: [
      { title: "Disclaimer of Warranties", paragraphs: ["To the fullest extent permitted by applicable Indian law, the Website, content, materials, Products, and Services are provided on an as-is and as-available basis without express, implied, statutory, or other warranties."], bullets: ["Merchantability and fitness for a particular purpose.", "Title, non-infringement, and quiet enjoyment.", "Accuracy, completeness, and reliability of content.", "Continuous availability, error-free operation, or freedom from harmful code.", "Compatibility with every device and browser."] },
      { title: "Limitation of Liability", paragraphs: ["To the fullest extent permitted by applicable Indian law, ROB0MANIAC TECH LLP, its directors, officers, employees, agents, affiliates, and representatives are not liable for indirect, incidental, special, consequential, or punitive damages, lost profit, revenue, savings, data, opportunity, reputation, or unauthorized access arising from use of the Website, Products, or Services."], },
      { title: "Product Information and Specifications", bullets: ["Descriptions, specifications, images, and pricing may contain errors.", "Images are illustrative and actual colors, dimensions, or attributes may vary.", "Pricing errors may be corrected without liability.", "The remedy for materially inaccurate product information is governed by the Refund and Return Policy."] },
      { title: "Limitation on Refunds", paragraphs: ["Refunds available under the Refund and Return Policy are the remedy for product or service claims to the extent permitted by law. Nothing in this policy excludes rights that cannot legally be excluded."] },
      { title: "User Responsibility", bullets: ["Your use of the Website and Services.", "Access to third-party links.", "Reliance on Website content.", "Protection of your device, data, and account.", "Compliance by anyone using your account."] },
      { title: "Third-Party Content and Services", paragraphs: ["We do not control and are not responsible for the accuracy, quality, legality, privacy practices, availability, or security of third-party websites, content, products, or services."] },
      { title: "No Professional Advice", paragraphs: ["Website information is general product information and is not legal, medical, financial, engineering-certification, or other professional advice. Consult a qualified professional for advice specific to your circumstances."] },
      { title: "Compliance with Laws", paragraphs: ["You are responsible for ensuring that your use of the Website, Products, and Services complies with laws and regulations applicable to you. We are not liable for a user's violation of law."] },
    ],
  },
  cookiePolicy: {
    ...shared,
    key: "cookiePolicy",
    title: "Cookie Policy",
    shortTitle: "Cookies",
    description: "The cookies and browser storage RoboRoot uses, why they are used, and how to control them.",
    sections: [
      { title: "What Cookies and Tracking Technologies Are", paragraphs: ["Cookies are small text files stored on a device by a website. Related technologies include pixels, web beacons, and local storage."], bullets: ["Session cookies are removed when the browser closes.", "Persistent cookies remain until their expiry or removal.", "First-party cookies are set by RoboRoot.", "Third-party cookies are set by external services."] },
      { title: "Types of Cookies We Use", groups: [
        { title: "Essential", paragraphs: ["Required for login, security, cart, payment, session management, and recording your consent choice. These cannot be disabled through our preference panel."] },
        { title: "Preference", paragraphs: ["Remember optional interface and storefront settings when you enable them."] },
        { title: "Analytics", paragraphs: ["Help measure traffic and interactions when you enable them."] },
        { title: "Marketing", paragraphs: ["May support relevant advertising and campaign measurement when enabled. RoboRoot does not currently set marketing cookies directly."] },
      ] },
      { title: "Third-Party Services", groups: [
        { title: "Analytics", paragraphs: ["Where enabled, analytics providers may measure traffic and usage under their own privacy terms."] },
        { title: "Payment providers", paragraphs: ["Payment providers use technologies required to secure and complete a transaction."] },
        { title: "Customer support and advertising", paragraphs: ["Support or advertising providers may use technologies only when integrated and permitted by your choice or applicable law."] },
      ] },
      { title: "Your Preferences and Choices", paragraphs: ["The cookie banner lets you accept all categories, use essential cookies only, or choose categories individually. You can reopen Cookie Settings from the footer at any time. Each choice is logged with a pseudonymous consent ID, policy version, timestamp, IP address, and user agent; if you sign in, the record may be linked to your account."], bullets: ["Use browser settings to block or delete cookies.", "Use Cookie Settings to change optional categories.", "Use provider opt-out tools where applicable."] },
      { title: "Impact of Disabling Cookies", paragraphs: ["Blocking essential cookies may prevent account access, cart continuity, security validation, payment, and other core functions. Disabling optional cookies may reduce personalization or measurement but does not prevent basic shopping."], },
      { title: "Do Not Track Signals", paragraphs: ["Some browsers send Do Not Track signals. The Website does not currently respond automatically to those signals; use Cookie Settings and provider opt-out controls instead."], },
      { title: "Updates to This Policy", paragraphs: ["We may update this policy for changes in technology, law, or our practices. A revised version and Last Updated date will be posted here, and the consent banner will ask again when the policy version changes."], },
      { title: "Contact Information", paragraphs: ["For cookie questions, email support@roboroot.in. Registered office: Mumbai, Maharashtra, India."], },
    ],
  },
};

export const legalNavigation = (Object.keys(legalPolicies) as LegalPolicyKey[]).map((key) => ({
  key,
  label: legalPolicies[key].shortTitle,
  href: LEGAL_POLICY_LINKS[key],
}));
