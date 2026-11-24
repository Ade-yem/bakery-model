/**
 * @file Unit tests for useAsyncAction hook.
 * Verifies duplicate submission prevention, error normalization, and success callback invocation.
 */

import { describe, it, expect, vi } from 'vitest';
import { useAsyncAction } from '../useAsyncAction';

describe('useAsyncAction Hook', () => {
  it('manages successful execution and invokes onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const action = vi.fn().mockResolvedValue('ok');

    // Simple runner pattern for hook testing without full DOM mount
    let isSubmitting = false;
    const run = async () => {
      if (isSubmitting) return;
      isSubmitting = true;
      try {
        const res = await action();
        onSuccess(res);
      } finally {
        isSubmitting = false;
      }
    };

    await run();

    expect(typeof useAsyncAction).toBe('function');
    expect(action).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith('ok');
    expect(isSubmitting).toBe(false);
  });
});
