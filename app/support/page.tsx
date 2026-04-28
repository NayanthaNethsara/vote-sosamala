import {
  WhatsappLogo,
  InstagramLogo,
  GithubLogo,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site-config";

export default function SupportPage() {
  return (
    <div className="relative min-h-screen px-4 py-20 text-amber-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-5xl">
            Support & Privacy
          </h1>
          <p className="mx-auto max-w-2xl text-xs font-bold uppercase tracking-[0.3em] text-amber-200/50">
            SLIIT Wasantha Udanaya 2026 Official Voting Platform
          </p>
        </div>

        {/* Rules & Guidelines Section */}
        <section id="rules-guidelines" className="scroll-mt-24 space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-200/10" />
            <h2 className="text-2xl font-bold tracking-tight text-amber-100">
              Rules & Guidelines
            </h2>
            <div className="h-px flex-1 bg-linear-to-r from-amber-200/10 to-transparent" />
          </div>

          <Card className="border-amber-200/10 bg-amber-50/5 shadow-2xl backdrop-blur-2xl">
            <CardContent className="grid gap-8 p-8 text-sm leading-7 text-amber-100/70 sm:p-12 sm:text-base md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  1. Eligibility to Vote
                </h3>
                <p>
                  Voting is open to everyone with a valid Google account.
                  Authentication is required to participate in the voting
                  process to ensure authenticity and prevent automated
                  manipulation.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  2. Voting Limits
                </h3>
                <p>
                  Each registered user can cast exactly{" "}
                  <strong>one vote</strong> in each category: one for Aurudu
                  Kumara and one for Aurudu Kumariya. Once a vote is cast, it is
                  recorded securely in the system.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  3. Validation & Monitoring
                </h3>
                <p>
                  Live votes are monitored <strong>hourly</strong> to verify and
                  validate authenticity. The technical team reserves the right
                  to cancel or adjust votes that are found to be fraudulent or
                  generated through system manipulation.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  4. Fair Play & DQ
                </h3>
                <p>
                  Any attempt to manipulate the voting system (multiple
                  accounts, automated scripts, or botting) will lead to the
                  immediate disqualification of those votes and potentially the
                  associated contestants.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  5. Final Decision
                </h3>
                <p>
                  Final results are based on <strong>validated votes</strong>.
                  The Wasantha Udanaya Organizing Committee reserves the right
                  to make the final decision. The final reveal will happen in
                  the presence of all contestants to ensure complete
                  transparency and address any concerns.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">6. Disputes</h3>
                <p>
                  In the event of a technical discrepancy or dispute, the
                  Committee’s decision shall be final. Contestants will have the
                  opportunity to discuss concerns during the final validation
                  session.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
        {/* Privacy Policy Section */}
        <section id="privacy-policy" className="scroll-mt-24 space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-200/10" />
            <h2 className="text-2xl font-bold tracking-tight text-amber-100">
              Privacy Policy
            </h2>
            <div className="h-px flex-1 bg-linear-to-r from-amber-200/10 to-transparent" />
          </div>

          <Card className="border-amber-200/10 bg-amber-50/5 shadow-2xl backdrop-blur-2xl">
            <CardContent className="space-y-8 p-8 text-sm leading-8 text-amber-100/70 sm:p-12 sm:text-base">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  1. Data Collection
                </h3>
                <p>
                  We prioritize your privacy above all else. When you use this
                  platform to vote, we collect only the essential information
                  required to ensure a fair and transparent voting process. This
                  primarily involves using your unique identifier from Google
                  Authentication to prevent duplicate voting.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  2. Usage of Information
                </h3>
                <p>
                  Your authentication data is strictly used to validate your
                  identity and record your vote. We do not store personal emails
                  for marketing, nor do we share your data with any third-party
                  entities outside of the necessary Supabase infrastructure used
                  to run the platform.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  3. Cookies & Security
                </h3>
                <p>
                  Essential cookies are utilized to manage your secure session
                  via Supabase. These technical cookies ensure you remain logged
                  in while browsing and that your vote is securely transmitted
                  and recorded.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-50">
                  4. Disclaimer & Beta Release
                </h3>
                <p>
                  {siteConfig.name} is currently in beta release. While we
                  strive for maximum reliability, we provide this system
                  &quot;as-is&quot; and do not assume any responsibility for
                  technical discrepancies, vote count issues, or service
                  interruptions.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support Section */}
        <section id="technical-support" className="scroll-mt-24 space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-amber-200/10" />
            <h2 className="text-2xl font-bold tracking-tight text-amber-100">
              Technical Support
            </h2>
            <div className="h-px flex-1 bg-linear-to-r from-amber-200/10 to-transparent" />
          </div>

          <Card className="border-amber-200/10 bg-amber-50/5 shadow-2xl backdrop-blur-2xl">
            <CardContent className="p-8 text-center sm:p-12">
              <p className="mx-auto max-w-xl text-sm leading-8 text-amber-100/70 sm:text-base">
                Encountering issues with voting or have a query regarding the
                platform? Contact our technical team directly for assistance.
              </p>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-200/40">
                The platform is open source — contributions are welcome.
              </p>

              <div className="mt-10 flex items-center justify-center gap-8">
                <a
                  href="https://wa.me/94702358060"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/5 transition-all hover:border-amber-500/50 hover:bg-amber-500/10"
                  aria-label="WhatsApp Support"
                >
                  <WhatsappLogo
                    size={28}
                    weight="fill"
                    className="text-amber-200/60 transition-colors group-hover:text-amber-200"
                  />
                </a>
                <a
                  href="https://instagram.com/nayaa.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-200/10 bg-white/5 transition-all hover:border-amber-200/30 hover:bg-white/10"
                  aria-label="Instagram Support"
                >
                  <InstagramLogo
                    size={28}
                    weight="fill"
                    className="text-amber-200/60 transition-colors group-hover:text-amber-200"
                  />
                </a>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                  aria-label="GitHub Repository"
                >
                  <GithubLogo
                    size={28}
                    weight="fill"
                    className="text-amber-200/60 transition-colors group-hover:text-amber-200"
                  />
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="space-y-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-100/20">
            {siteConfig.name} Team © 2026
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-amber-100/10">
            Last updated: April 27, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
