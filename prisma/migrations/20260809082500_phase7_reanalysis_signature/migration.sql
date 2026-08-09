DROP INDEX IF EXISTS "DecisionRecord_featureSnapshotId_expertSystemVersion_scorin_key";

CREATE UNIQUE INDEX "DecisionRecord_featureSnapshotId_expertSystemVersion_scoringPol_key"
ON "DecisionRecord"(
  "featureSnapshotId",
  "expertSystemVersion",
  "scoringPolicyVersion",
  "weeklyActionPolicyVersion",
  "inputSignature"
);
