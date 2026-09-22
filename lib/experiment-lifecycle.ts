export const EXPERIMENT_STATUSES = [
  "active",
  "paused",
  "completed",
] as const;

export type ExperimentStatus =
  (typeof EXPERIMENT_STATUSES)[number];

export function isValidExperimentStatus(
  status: string
): status is ExperimentStatus {
  return EXPERIMENT_STATUSES.includes(
    status as ExperimentStatus
  );
}

export function canTransitionExperimentStatus(
  currentStatus: ExperimentStatus,
  requestedStatus: ExperimentStatus
): boolean {
  // Completed experiments are immutable.
  if (currentStatus === "completed") {
    return false;
  }

  // No-op transitions are not needed.
  if (currentStatus === requestedStatus) {
    return false;
  }

  // active → paused
  // active → completed
  if (currentStatus === "active") {
    return (
      requestedStatus === "paused" ||
      requestedStatus === "completed"
    );
  }

  // paused → active
  // paused → completed
  if (currentStatus === "paused") {
    return (
      requestedStatus === "active" ||
      requestedStatus === "completed"
    );
  }

  return false;
}