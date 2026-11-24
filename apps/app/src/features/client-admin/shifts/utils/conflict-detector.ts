/**
 * @file Shift conflict detection and validation engine.
 */

import type { ClientShift, ShiftConflict } from '../../types';

/**
 * Converts a "HH:mm" time string into total minutes from midnight.
 *
 * @param {string} timeStr - Time string formatted as HH:mm.
 * @returns {number} Total minutes elapsed from 00:00.
 */
function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return -1;
  }
  return parts[0] * 60 + parts[1];
}

/**
 * Checks whether two time intervals overlap.
 * Supports overnight shifts (intervals that wrap around midnight).
 *
 * @param {number} startA - Start time A in minutes.
 * @param {number} endA - End time A in minutes.
 * @param {number} startB - Start time B in minutes.
 * @param {number} endB - End time B in minutes.
 * @returns {boolean} True if intervals overlap.
 */
export function doIntervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  // Normalize intervals if overnight (e.g., 22:00 to 06:00 -> 1320 to 360)
  const normA = endA <= startA ? [ { s: startA, e: 1440 }, { s: 0, e: endA } ] : [ { s: startA, e: endA } ];
  const normB = endB <= startB ? [ { s: startB, e: 1440 }, { s: 0, e: endB } ] : [ { s: startB, e: endB } ];

  for (const segA of normA) {
    for (const segB of normB) {
      if (Math.max(segA.s, segB.s) < Math.min(segA.e, segB.e)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @description Validates a shift time string and range.
 * @param {string} startTime - Start time (HH:mm).
 * @param {string} endTime - End time (HH:mm).
 * @returns {{ isValid: boolean; error?: string }} Validation outcome.
 * @example
 * ```ts
 * const check = validateTimeRange('08:00', '16:00');
 * ```
 */
export function validateTimeRange(
  startTime: string,
  endTime: string
): { isValid: boolean; error?: string } {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (startMin === -1 || endMin === -1) {
    return { isValid: false, error: 'Invalid time format. Use HH:mm.' };
  }

  if (startMin === endMin) {
    return { isValid: false, error: 'Shift start time and end time cannot be identical.' };
  }

  return { isValid: true };
}

export interface ConflictDetectorInput {
  targetShift: Partial<ClientShift>;
  existingShifts: ClientShift[];
  staffDirectory?: Record<string, string>; // staffId -> fullName map
}

/**
 * @description Analyzes a proposed shift for scheduling conflicts against existing shifts.
 * Detects invalid time ranges, overlapping shifts on matching days, and duplicate staff assignments.
 *
 * @param {ConflictDetectorInput} input - Target shift draft, list of existing shifts, and staff directory.
 * @returns {ShiftConflict[]} Array of detected scheduling conflicts, if any.
 * @example
 * ```ts
 * const conflicts = detectShiftConflicts({
 *   targetShift: newShift,
 *   existingShifts: currentShifts,
 *   staffDirectory: { 'staff-1': 'Danladi Bello' }
 * });
 * ```
 */
export function detectShiftConflicts({
  targetShift,
  existingShifts,
  staffDirectory = {},
}: ConflictDetectorInput): ShiftConflict[] {
  const conflicts: ShiftConflict[] = [];

  const startTime = targetShift.startTime || '';
  const endTime = targetShift.endTime || '';

  const timeValidation = validateTimeRange(startTime, endTime);
  if (!timeValidation.isValid) {
    conflicts.push({
      type: 'invalid_time_range',
      message: timeValidation.error || 'Invalid time range.',
    });
    return conflicts;
  }

  const targetStartMin = parseTimeToMinutes(startTime);
  const targetEndMin = parseTimeToMinutes(endTime);
  const targetDays = targetShift.shiftDays || [];
  const targetStaffIds = targetShift.assignedStaffIds || [];
  const targetShiftId = targetShift.id;

  for (const existing of existingShifts) {
    // Skip self when editing an existing shift
    if (targetShiftId && existing.id === targetShiftId) {
      continue;
    }
    // Only compare active shifts
    if (existing.status !== 'active') {
      continue;
    }

    // Check if there is an overlapping day of week
    const commonDays = existing.shiftDays.filter((d) => targetDays.includes(d));
    if (commonDays.length === 0) {
      continue;
    }

    const existStartMin = parseTimeToMinutes(existing.startTime);
    const existEndMin = parseTimeToMinutes(existing.endTime);
    if (existStartMin === -1 || existEndMin === -1) {
      continue;
    }

    const timesOverlap = doIntervalsOverlap(targetStartMin, targetEndMin, existStartMin, existEndMin);

    if (timesOverlap) {
      // 1. Check for duplicate staff scheduled across overlapping shifts
      for (const staffId of targetStaffIds) {
        if (existing.assignedStaffIds.includes(staffId)) {
          const staffName = staffDirectory[staffId] || staffId;
          const daysStr = commonDays.join(', ').toUpperCase();
          conflicts.push({
            type: 'duplicate_staff',
            staffId,
            staffName,
            conflictingShiftId: existing.id,
            conflictingShiftName: existing.name,
            message: `Staff member "${staffName}" is already scheduled on overlapping shift "${existing.name}" on ${daysStr}.`,
          });
        }
      }

      // 2. Check for same department overlapping shifts if in identical branch/dept
      if (
        targetShift.assignedDepartmentId &&
        existing.assignedDepartmentId === targetShift.assignedDepartmentId &&
        targetShift.assignedBranchId === existing.assignedBranchId
      ) {
        conflicts.push({
          type: 'time_overlap',
          conflictingShiftId: existing.id,
          conflictingShiftName: existing.name,
          message: `Shift schedule overlaps with existing department shift "${existing.name}" (${existing.startTime} - ${existing.endTime}) on ${commonDays.join(', ').toUpperCase()}.`,
        });
      }
    }
  }

  return conflicts;
}
