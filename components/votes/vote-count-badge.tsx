import { getContestantVoteCountAction } from "@/app/actions/public/contestant-actions";
import { Badge } from "@/components/ui/badge";

type VoteCountBadgeProps = {
  contestantId: string;
};

export async function VoteCountBadge({ contestantId }: VoteCountBadgeProps) {
  const voteCount = await getContestantVoteCountAction(contestantId);

  return (
    <Badge className="bg-emerald-500 text-white">{`${voteCount} votes`}</Badge>
  );
}
