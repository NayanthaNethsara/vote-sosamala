"use client";

import { Gear } from "@phosphor-icons/react";

export default function SettingsAdminPage() {
  return (
    <div className="py-10 px-6 sm:px-8 max-w-5xl mx-auto space-y-8 font-mono">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure system preferences and rules.
        </p>
      </div>
      <div className="border bg-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <Gear size={48} className="text-muted-foreground/30" />
        <div>
          <p className="font-semibold text-lg">System Settings</p>
          <p className="text-muted-foreground text-sm">
            Event scheduling, rules, and advanced options will live here.
          </p>
        </div>
      </div>
    </div>
  );
}
