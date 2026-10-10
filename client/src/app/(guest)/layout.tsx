"use client";

import AuthFooter from "../components/auth-footer";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen ">
      <main className="border-b border-border  w-full bg-primary">
        <div className="mb-[80px] md:mb-[0px]"> </div>
        {children}

        <AuthFooter />
      </main>
    </div>
  );
}
