"use client"
import React from 'react'
import Image from 'next/image'
import Link from "next/link"
import { FiTwitter, FiGithub, FiLinkedin } from "react-icons/fi"

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50/60 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3 inline-flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="LexPro Logo"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-lg font-bold">Qazi Law</span>
            </div>
            <p className="text-sm text-zinc-600">
              Empowering legal professionals with modern tools and insights.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:col-span-2 md:grid-cols-4">
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>
                  <Link href="/blogs" className="hover:text-emerald-600">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-emerald-600">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>
                  <Link href="/about" className="hover:text-emerald-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-emerald-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>
                  <a href="#" className="hover:text-emerald-600">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-600">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Follow</h4>
              <div className="flex gap-3 text-zinc-600">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="transition hover:text-emerald-600"
                >
                  <FiTwitter />
                </a>
                <a
                  href="#"
                  aria-label="GitHub"
                  className="transition hover:text-emerald-600"
                >
                  <FiGithub />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="transition hover:text-emerald-600"
                >
                  <FiLinkedin />
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-zinc-500">
          © {new Date().getFullYear()} Qazi Law. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
