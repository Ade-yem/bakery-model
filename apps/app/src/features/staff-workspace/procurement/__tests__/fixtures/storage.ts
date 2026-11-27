/** @file Re-export validated localStorage persistence helpers for tests. */
export {
  storageKey,
  loadProcurementPreview,
  saveProcurementPreview,
  resetProcurementPreview,
  type ProcurementLoadResult,
} from '../../preview-storage';
