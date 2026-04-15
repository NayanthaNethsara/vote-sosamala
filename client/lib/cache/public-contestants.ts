import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicContestantsCache() {
  revalidateTag("public-contestants", "max");
  revalidatePath("/");
}
