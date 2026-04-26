import { signInWithGoogle } from "@/app/auth/actions";
import { GoogleIcon } from "@/components/icons/google-icon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const hasError = Boolean(params.error);
  const errorMessage = params.message ?? "An authentication error occurred";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-green-400 via-yellow-400 to-pink-400">
            Sosamala Voting
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Sign in to cast your vote
          </p>
        </div>

        {hasError && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {errorMessage}
          </div>
        )}

        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={params.next ?? "/"} />
          <button
            type="submit"
            id="google-sign-in-button"
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          By signing in, you agree to our terms of use.
        </p>
      </div>
    </div>
  );
}
