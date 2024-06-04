export const parseQueryParam = (param, defaultValue) => {
  const parsed = parseInt(param);
  return Number.isInteger(parsed) ? parsed : defaultValue;
};
