const formatCurrency = (value, locale = navigator.language, currency = "INR") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};

export default formatCurrency;