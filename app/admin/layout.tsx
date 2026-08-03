import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "DALO Operations",
    template: "%s | DALO Operations",
  },
  description: "DALO order, catalog and customer operations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
