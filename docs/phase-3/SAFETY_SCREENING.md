# Safety Screening

Safety screening is a backend-owned, versioned session flow. The active template and questions come from configuration, not static frontend copy. Answers (`YES`, `NO`, `NOT_SURE`) autosave per session and can be retried without discarding local input.

The Phase 3 seed deliberately uses only three generic Phase 0-aligned placeholders:

1. a concerning change;
2. a professional restriction on a program/activity;
3. important risk information the user may not know.

All are labeled `DEVELOPMENT CONTENT / REQUIRES EXPERT VALIDATION`. More detailed medical questions were not invented because the source documents do not approve them.

Completion rejects missing required answers as `UNKNOWN`; it never silently treats uncertainty as safe. A completed `SafetyResult` stores profile/session IDs, status, triggered rule IDs, restricted programs, referral flag, rule version, and completion time.

User presentation always combines icon, text label, and description. RED language requests professional review without diagnosis or alarming raw medical flags.
