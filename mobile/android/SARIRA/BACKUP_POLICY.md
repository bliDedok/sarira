# SARIRA Android Backup Policy

## Decision

Android backup is disabled by default with `android:allowBackup="false"`. Explicit exclude-all rules are also applied to legacy full backup, Android 12+ cloud backup, and device transfer so the policy does not rely on a single manifest flag.

SARIRA is a wellness application and may later handle health-adjacent or personally sensitive data. A default-deny policy prevents future storage from silently entering cloud backup or device-transfer flows before its sensitivity has been reviewed.

## Review gate

Backup may only be enabled after all of the following are defined:

1. A complete inventory and sensitivity classification of locally stored data.
2. Explicit exclusion rules for credentials, tokens, health-adjacent data, and user identifiers.
3. Encryption and device-transfer requirements for data that is safe to restore.
4. Backup and restore tests across the supported Android versions.

No custom backup, API, or persistence implementation is introduced by this policy.
