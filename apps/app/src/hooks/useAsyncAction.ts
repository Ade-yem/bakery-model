/**
 * @file Reusable async action hook for forms and data operations.
 * Prevents duplicate submissions (isSubmitting lock), captures safe errors,
 * and coordinates success notifications.
 */

import { useState, useCallback } from 'react';

export interface UseAsyncActionOptions<R = unknown> {
  onSuccess?: (result: R) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncActionResult<T extends unknown[], R> {
  execute: (...args: T) => Promise<R | undefined>;
  isSubmitting: boolean;
  error: Error | null;
  clearError: () => void;
}

/**
 * @description Wraps an asynchronous action (form submit, delete, update) with duplicate submission prevention and safe error capture.
 * @template T
 * @template R
 * @param {(...args: T) => Promise<R>} actionFn - Async function to run.
 * @param {UseAsyncActionOptions<R>} options - Success and error callbacks.
 * @returns {UseAsyncActionResult<T, R>} Execution trigger and status state.
 * @example
 * ```ts
 * const { execute: handleSave, isSubmitting } = useAsyncAction(saveBranch, {
 *   onSuccess: () => reloadBranches(),
 * });
 * ```
 */
export function useAsyncAction<T extends unknown[], R>(
  actionFn: (...args: T) => Promise<R>,
  options: UseAsyncActionOptions<R> = {}
): UseAsyncActionResult<T, R> {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async (...args: T): Promise<R | undefined> => {
      // Prevent concurrent duplicate executions
      if (isSubmitting) {
        return undefined;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await actionFn(...args);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err) {
        const normalizedError = err instanceof Error ? err : new Error(String(err));
        setError(normalizedError);
        if (options.onError) {
          options.onError(normalizedError);
        }
        return undefined;
      } finally {
        setIsSubmitting(false);
      }
    },
    [actionFn, isSubmitting, options]
  );

  return {
    execute,
    isSubmitting,
    error,
    clearError,
  };
}
