import { getAdminUserOrRedirect } from "@/lib/utils/auth";
import { getAllContestants } from "@/lib/db/contestants";
import LogoutButton from "@/components/logout-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, UserPlus, Settings } from "lucide-react";
import { AddContestantForm } from "./add-contestant-form";

export default async function AdminPage() {
  const user = await getAdminUserOrRedirect();
  const contestants = await getAllContestants();

  return (
    <main className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.email}</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex justify-end">
          <LogoutButton />
        </div>
        <Tabs defaultValue="contestants" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="contestants"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Contestants
            </TabsTrigger>
            <TabsTrigger
              value="add-contestant"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Contestant
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contestants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Contestants</CardTitle>
                <CardDescription>
                  View, edit, and manage all contestants in the system.
                </CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-contestant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Contestant</CardTitle>
                <CardDescription>
                  Add a new contestant to the competition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddContestantForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Settings panel coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
