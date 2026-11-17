import { describe, expect, it } from 'vitest';
import { authenticateDemo, readDemoSession, DEMO_PASSWORD } from './session';

describe('isolated demo authentication', () => {
  it('accepts only the documented demo credentials', () => {
    expect(authenticateDemo(' Production@demo.tallybakery.test ', DEMO_PASSWORD)?.department).toBe(
      'production'
    );
    expect(authenticateDemo('reception@demo.tallybakery.test', DEMO_PASSWORD)?.department).toBe(
      'reception'
    );
    expect(authenticateDemo('disbursement@demo.tallybakery.test', DEMO_PASSWORD)?.department).toBe(
      'disbursement'
    );
    expect(authenticateDemo('procurement@demo.tallybakery.test', DEMO_PASSWORD)?.department).toBe(
      'procurement'
    );
    expect(authenticateDemo('owner@example.com', DEMO_PASSWORD)).toBeNull();
    expect(authenticateDemo('production@demo.tallybakery.test', 'wrong')).toBeNull();
  });
  it('rejects malformed, expired and unknown stored sessions', () => {
    expect(readDemoSession('{')).toBeNull();
    expect(
      readDemoSession(JSON.stringify({ department: 'owner', expiresAt: Date.now() + 1000 }))
    ).toBeNull();
    expect(readDemoSession(JSON.stringify({ department: 'production', expiresAt: 1 }))).toBeNull();
  });
  it('restores a valid demo identity without storing credentials', () => {
    const session = authenticateDemo('production@demo.tallybakery.test', DEMO_PASSWORD)!;
    expect(readDemoSession(JSON.stringify(session))).toEqual(session);
    expect(JSON.stringify(session)).not.toContain(DEMO_PASSWORD);
  });
});
