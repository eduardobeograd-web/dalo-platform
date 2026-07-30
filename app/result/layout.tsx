import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your eSIM Recommendation | DALO",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
