import type { CheckoutDraftRecord } from '../features/account/types';

const CHECKOUT_DRAFT_STORAGE_KEY = 'reeq_web_checkout_draft';

export function createWebCheckoutReference() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveWebCheckoutDraft(
  input: Omit<CheckoutDraftRecord, 'reference'> & { reference?: string },
) {
  const record: CheckoutDraftRecord = {
    ...input,
    reference: input.reference || createWebCheckoutReference(),
  };

  localStorage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function loadWebCheckoutDraft() {
  const rawValue = localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CheckoutDraftRecord;
  } catch {
    return null;
  }
}

export function clearWebCheckoutDraft() {
  localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
}
