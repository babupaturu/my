
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin'
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
};
