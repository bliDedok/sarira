# Privacy and Safety Notes

- Collect only profile and onboarding data required for Phase 3; derive age from DOB.
- Keep child/guardian records linked and distinct; no dependent health analysis is enabled.
- Record consent type/version/status/source/timestamps and let users view or revoke consent in Settings.
- Optional consent never unlocks unrelated access. Device permissions are requested only when a future feature needs them.
- Audit logs contain event and record reference plus minimal metadata, never the full questionnaire or safety answer payload.
- API logs redact answer bodies and guardian names. Provider/database secrets are server-only and example values are explicitly local-development-only.
- Repository methods and bearer authorization scope personal reads/writes to the current owner. Administrative configuration is read-only and role-gated.
- Error responses omit internal stacks; server logs retain structured internal error context.

## Open privacy/legal gates

Legal/Privacy must approve consent copy and version transition rules, parental-consent evidence, identity verification needs, retention periods, data export/deletion procedures, incident handling, and regional requirements. The current guardian flow does not claim automatic regulatory compliance.

Safety/questionnaire content, bounds, message keys, and program restrictions require expert review before their content status can change from `DEVELOPMENT_REQUIRES_EXPERT_VALIDATION` to active.
