/**
 * @file Unit tests for Shift Conflict Detection Engine.
 */

import { describe, it, expect } from 'vitest';
import {
  validateTimeRange,
  doIntervalsOverlap,
  detectShiftConflicts,
} from '../conflict-detector';
import type { ClientShift } from '../../../types';

describe('Shift Conflict Detection Engine', () => {
  describe('validateTimeRange', () => {
    it('accepts valid daytime hours', () => {
      const res = validateTimeRange('08:00', '16:00');
      expect(res.isValid).toBe(true);
    });

    it('accepts valid overnight shift hours', () => {
      const res = validateTimeRange('22:00', '06:00');
      expect(res.isValid).toBe(true);
    });

    it('rejects identical start and end times', () => {
      const res = validateTimeRange('12:00', '12:00');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('identical');
    });

    it('rejects malformed time strings', () => {
      const res = validateTimeRange('invalid', '12:00');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Invalid time format');
    });
  });

  describe('doIntervalsOverlap', () => {
    it('detects standard daytime overlaps', () => {
      // 08:00 - 16:00 (480 - 960) vs 14:00 - 22:00 (840 - 1320)
      expect(doIntervalsOverlap(480, 960, 840, 1320)).toBe(true);
    });

    it('detects completely non-overlapping daytime shifts', () => {
      // 06:00 - 14:00 (360 - 840) vs 14:00 - 22:00 (840 - 1320)
      expect(doIntervalsOverlap(360, 840, 840, 1320)).toBe(false);
    });

    it('detects overnight overlap with morning shift', () => {
      // Overnight 22:00 - 06:00 (1320 - 360) vs Morning 05:00 - 13:00 (300 - 780)
      expect(doIntervalsOverlap(1320, 360, 300, 780)).toBe(true);
    });

    it('detects no overlap between afternoon shift and overnight shift', () => {
      // 12:00 - 18:00 (720 - 1080) vs 22:00 - 06:00 (1320 - 360)
      expect(doIntervalsOverlap(720, 1080, 1320, 360)).toBe(false);
    });
  });

  describe('detectShiftConflicts', () => {
    const existingShifts: ClientShift[] = [
      {
        id: 'shift-morning-1',
        businessId: 'TEN-001',
        name: 'Morning Bake Shift',
        shiftType: 'day',
        startTime: '06:00',
        endTime: '14:00',
        assignedDepartmentId: 'dept-prod',
        assignedBranchId: 'branch-1',
        assignedStaffIds: ['staff-1', 'staff-2'],
        shiftDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        rotationPattern: 'fixed',
        status: 'active',
        createdAt: '2026-01-01',
      },
      {
        id: 'shift-evening-1',
        businessId: 'TEN-001',
        name: 'Evening Packing Shift',
        shiftType: 'evening',
        startTime: '14:00',
        endTime: '22:00',
        assignedDepartmentId: 'dept-prod',
        assignedBranchId: 'branch-1',
        assignedStaffIds: ['staff-3'],
        shiftDays: ['mon', 'tue', 'wed'],
        rotationPattern: 'fixed',
        status: 'active',
        createdAt: '2026-01-01',
      },
    ];

    const staffDirectory = {
      'staff-1': 'Danladi Bello',
      'staff-2': 'Chioma Okafor',
      'staff-3': 'Emmanuel Ade',
    };

    it('flags duplicate staff scheduled on overlapping shifts on the same day', () => {
      const draft: Partial<ClientShift> = {
        name: 'Midday Prep Shift',
        startTime: '10:00',
        endTime: '18:00',
        assignedDepartmentId: 'dept-pack',
        assignedBranchId: 'branch-1',
        assignedStaffIds: ['staff-1'], // staff-1 is on Morning Bake Shift (06:00 - 14:00)
        shiftDays: ['mon'],
      };

      const conflicts = detectShiftConflicts({
        targetShift: draft,
        existingShifts,
        staffDirectory,
      });

      expect(conflicts.length).toBeGreaterThan(0);
      const dup = conflicts.find((c) => c.type === 'duplicate_staff');
      expect(dup).toBeDefined();
      expect(dup?.staffName).toBe('Danladi Bello');
      expect(dup?.conflictingShiftName).toBe('Morning Bake Shift');
    });

    it('allows same staff on non-overlapping days', () => {
      const draft: Partial<ClientShift> = {
        name: 'Weekend Special Shift',
        startTime: '08:00',
        endTime: '16:00',
        assignedDepartmentId: 'dept-prod',
        assignedBranchId: 'branch-1',
        assignedStaffIds: ['staff-1'],
        shiftDays: ['sat', 'sun'], // No overlap with Mon-Fri Morning Shift
      };

      const conflicts = detectShiftConflicts({
        targetShift: draft,
        existingShifts,
        staffDirectory,
      });

      expect(conflicts).toHaveLength(0);
    });

    it('ignores inactive existing shifts when checking conflicts', () => {
      const inactiveExisting: ClientShift[] = [
        {
          ...existingShifts[0],
          status: 'inactive',
        },
      ];

      const draft: Partial<ClientShift> = {
        name: 'Replacement Morning Shift',
        startTime: '06:00',
        endTime: '14:00',
        assignedDepartmentId: 'dept-prod',
        assignedBranchId: 'branch-1',
        assignedStaffIds: ['staff-1'],
        shiftDays: ['mon'],
      };

      const conflicts = detectShiftConflicts({
        targetShift: draft,
        existingShifts: inactiveExisting,
        staffDirectory,
      });

      expect(conflicts).toHaveLength(0);
    });

    it('ignores comparing against the same shift when editing', () => {
      const draft: Partial<ClientShift> = {
        id: 'shift-morning-1', // Editing existing morning shift
        name: 'Morning Bake Shift (Renamed)',
        startTime: '06:00',
        endTime: '14:00',
        assignedDepartmentId: 'dept-prod',
        assignedBranchId: 'branch-1',
        assignedStaffIds: ['staff-1', 'staff-2'],
        shiftDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      };

      const conflicts = detectShiftConflicts({
        targetShift: draft,
        existingShifts,
        staffDirectory,
      });

      expect(conflicts).toHaveLength(0);
    });
  });
});
