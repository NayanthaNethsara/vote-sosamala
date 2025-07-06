import React from "react";
import { getUserOrNull } from "@/lib/utils/auth";
import { VotingHeader } from "@/components/vote-header";

// Layout gets children and params, but we'll just ignore params.
export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserOrNull();

  return (
    <section>
      <VotingHeader user={user} />
      {children}
    </section>
  );
}
