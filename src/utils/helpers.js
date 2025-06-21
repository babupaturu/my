
export const generateOrderNumber = (orderId) => {
  return `ORD${orderId.toString().padStart(6, '0')}`;
};

export const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

export const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

export const calculateTax = (amount, taxRate = 0.1) => {
  return amount * taxRate;
};

export const paginateResults = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalPages = Math.ceil(total / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    offset,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
