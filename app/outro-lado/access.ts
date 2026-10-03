/**
 * Reserved destination for the optional game. This is a release switch, NOT
 * proof of discovery or authorization. Keep it closed until the real game and
 * its author-approved discovery/validation flow are implemented together.
 */
export const OTHER_SIDE_PATH = "/outro-lado";
export const OTHER_SIDE_AVAILABLE = false;

export function getOtherSideDestination(
  discovered: boolean,
  available: boolean = OTHER_SIDE_AVAILABLE,
): string | null {
  return discovered === true && available === true ? OTHER_SIDE_PATH : null;
}
