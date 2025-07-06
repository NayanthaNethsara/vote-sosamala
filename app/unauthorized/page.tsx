import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-xl text-red-600 font-semibold">
        Unauthorized Access
      </h1>
      <Button asChild>
        <Link href="/">Go Back to Home</Link>
      </Button>
    </div>
  );
}
