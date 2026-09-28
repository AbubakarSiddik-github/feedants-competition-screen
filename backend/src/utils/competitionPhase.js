/**
 * Pure business logic — no I/O, trivially testable.
 *
 * Registration and submission windows are intentionally independent:
 * in the seed data, submission opens Aug 6 while registration doesn't
 * close until Aug 10, so the two overlap for four days.  Modeling this
 * as a single linear phase enum would silently misrepresent that overlap.
 */
function getPhaseInfo(competition, now = new Date()) {
  const registrationOpen = now < competition.registrationDeadline;
  const submissionOpen =
    now >= competition.submissionStart && now < competition.submissionEnd;
  const resultsDeclared = now >= competition.resultDate;
  const spotsLeft = competition.totalSpots - competition.spotsBooked;

  return { registrationOpen, submissionOpen, resultsDeclared, spotsLeft, now };
}

/**
 * Derive the CTA state from phase info + user's own registration/submission status.
 *
 * Returns { label, enabled, action } so UI can never let label and enabled drift apart.
 *
 * action values: "register" | "upload" | "view_results" | "none"
 */
function getCtaState(
  { registrationOpen, submissionOpen, resultsDeclared, spotsLeft },
  { isRegistered, hasSubmitted },
  competition
) {
  if (resultsDeclared) {
    return { label: "View Results", enabled: true, action: "view_results" };
  }

  if (!isRegistered) {
    if (registrationOpen && spotsLeft > 0) {
      return {
        label: `Register — ₹${competition.entryFee}`,
        enabled: true,
        action: "register",
      };
    }
    return { label: "Registration Closed", enabled: false, action: "none" };
  }

  // User is registered
  if (!submissionOpen) {
    const now = new Date();
    if (now < competition.submissionStart) {
      const date = competition.submissionStart.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return {
        label: `Submission opens on ${date}`,
        enabled: false,
        action: "none",
      };
    }
    // submissionEnd has passed
    return { label: "Submission Closed", enabled: false, action: "none" };
  }

  // submissionOpen
  if (hasSubmitted) {
    return { label: "Submission Uploaded ✓", enabled: false, action: "none" };
  }

  return { label: "Upload Submission", enabled: true, action: "upload" };
}

module.exports = { getPhaseInfo, getCtaState };
