"use client";

import Link from "next/link";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";

// Footer link section component
function FooterSection({ title, links }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-[#691080]">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-gray-700 hover:text-[#691080]">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Footer partner/security badges component
function FooterPartners({ partners }) {
  return (
    <div className="mt-6 md:mt-0">
      <h3 className="text-lg font-semibold mb-4 text-[#691080]">Trusted By</h3>
      <div className="flex flex-wrap gap-4 items-center">
        {partners.map((partner) => (
          <img
            key={partner.name}
            src={partner.logo}
            alt={partner.name}
            className="h-10 w-24 object-contain"
          />
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  // Updated links to point to dynamic info page
  const linkSections = [
    {
      title: "Quick Links",
      links: [
        { name: "Privacy Policy", href: "/info/privacy-policy" },
        { name: "Terms & Conditions", href: "/info/terms-conditions" },
        { name: "Contact Us", href: "/info/contact-us" },
        { name: "About Us", href: "/info/about-us" },
        { name: "Refund & Cancellation", href: "/info/refund-cancellation" },
      ],
    },
    {
      title: "Customer Support",
      links: [
        { name: "FAQ", href: "/info/faq" },
        { name: "Shipping & Delivery", href: "/info/shipping" },
        { name: "Returns", href: "/info/returns" },
      ],
    },
  ];

  const partners = [
    { name: "Razorpay", logo: "/partners/razorpay.png" },
    { name: "Visa", logo: "/partners/visa.png" },
    { name: "Mastercard", logo: "/partners/mastercard.png" },
    { name: "Shiprocket", logo: "/partners/shiprocket.png" },
  ];

  return (
    <footer className="bg-gray-100 text-gray-800 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Business Info */}
        <div>
          <h2 className="text-2xl font-bold mb-1 text-[#691080]">Krishna Toyverse</h2>
          <p className="text-sm text-gray-600 mb-2">
            A unit of{" "}
            <a
              href="https://www.instagram.com/krishna_super_mart/?hl=en"
              target="_blank"
              className="text-[#691080] hover:underline"
            >
              Krishna Super Mart
            </a>
          </p>
          <p>13 Toy Street, Haldwani, Uttarakhand, India</p>
          <p>
            Email:{" "}
            <a
              href="mailto:contact@krishnatoyverse.com"
              className="text-[#691080] hover:underline"
            >
              contact@krishnatoyverse.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+917895059555" className="text-[#691080] hover:underline">
              +91-7895059555
            </a>
          </p>

          {/* Social Handle */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Connect with us</p>
            <div className="flex items-center gap-4 text-2xl text-[#691080]">
              <a
                href="https://www.instagram.com/krishnatoyverse.retail/"
                target="_blank"
                className="hover:text-pink-600"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.facebook.com/krishnatoyverse"
                target="_blank"
                className="hover:text-blue-600"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a
                href="https://wa.me/917895059555"
                target="_blank"
                className="hover:text-green-600"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="md:col-span-1 grid grid-cols-2 gap-6">
          {linkSections.map((section) => (
            <FooterSection key={section.title} title={section.title} links={section.links} />
          ))}
        </div>

        {/* Partners / Trust */}
        <FooterPartners partners={partners} />
      </div>

      {/* Footer bottom */}
      <div className="text-center text-sm mt-12 border-t border-gray-300 pt-4 text-gray-600">
        &copy; {new Date().getFullYear()} Krishna Toyverse. All rights reserved.
      </div>
    </footer>
  );
}
