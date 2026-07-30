import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finding Your eSIM | DALO",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SearchingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
