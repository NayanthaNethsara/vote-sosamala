import LogoutButton from "@/components/logout-button";
import { getAdminUserOrRedirect } from "@/lib/auth/actions";

export default async function AdminPage() {
  const user = await getAdminUserOrRedirect(); // ✅ Ensures only admin gets here

  return (
    <main className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {user.email}</p>
      <LogoutButton />

      {/* Add Contestant Form or List can go here */}
    </main>
  );
}
