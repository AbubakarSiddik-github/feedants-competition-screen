/**
 * Shared pure logic — identical to backend/src/utils/competitionPhase.js
 * No I/O, no React imports. Reused by hooks and StickyCTABar.
 */

export function getPhaseInfo(competition, now = new Date()) {
  const registrationOpen = now < new Date(competition.registrationDeadline);
  const submissionOpen =
    now >= new Date(competition.submissionStart) &&
    now < new Date(competition.submissionEnd);
  const resultsDeclared = now >= new Date(competition.resultDate);
  const spotsLeft = competition.totalSpots - competition.spotsBooked;

  return { registrationOpen, submissionOpen, resultsDeclared, spotsLeft, now };
}

export function getCtaState(competition, { isRegistered, hasSubmitted }) {
  const phase = getPhaseInfo(competition);
  const { registrationOpen, submissionOpen, resultsDeclared, spotsLeft } = phase;

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

  // Registered
  if (!submissionOpen) {
    const now = new Date();
    if (now < new Date(competition.submissionStart)) {
      const date = new Date(competition.submissionStart).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      return {
        label: `Submission opens ${date}`,
        enabled: false,
        action: "none",
      };
    }
    return { label: "Submission Closed", enabled: false, action: "none" };
  }

  if (hasSubmitted) {
    return { label: "Submission Uploaded ✓", enabled: false, action: "none" };
  }

  return { label: "Upload Submission", enabled: true, action: "upload" };
}
