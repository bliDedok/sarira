# Privacy Foundation

## Implemented boundaries

- Identity (`User`) is separate from health profile (`Profile`) and dependent data.
- Consent text is versioned and hashed; grant/revoke records are timestamped.
- User owns profile, dependent, preference, device-session, and consent relations.
- Export-data and delete-account audit event types exist; UI shows workflow placeholders.
- Audit metadata is minimised and never stores full sensitive payloads.
- Storage has no health/body-photo bucket in Phase 2.
- Mock mode warns against real health data and stays replaceable.

## Legal validation required

- Lawful basis and guardian/teen assent wording.
- Age thresholds, parental authority evidence, withdrawal effects.
- Data residency and cross-border transfers.
- Retention/deletion windows, legal holds, backup deletion.
- Export format, identity verification, SLA, and correction workflow.
- Special-category health-data handling and incident notification.
- Telemetry/analytics consent and vendor DPAs.

No compliance certification is claimed. Product, Legal/Privacy, Security, and Clinical/Safety owners must approve before production health data is accepted.
