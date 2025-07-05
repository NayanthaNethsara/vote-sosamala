import { createHash } from 'crypto';

export function hashVoterEmail(email: string): string {
  const salt = process.env.VOTE_SALT!;
  return createHash('sha256').update(email + salt).digest('hex');
}
