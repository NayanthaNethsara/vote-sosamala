import React from "react";
import { getUserOrNull } from "@/lib/utils/auth";
import { VotingHeader } from "@/components/vote-header";

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
