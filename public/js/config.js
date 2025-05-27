const getBaseUrl = () => {
  const origin = window.location.origin;
  const path = window.location.pathname;

  if (path.includes("/bibliotech/view/")) {
    return `${origin}/bibliotech`;
  } else if (path.includes("/bibliotech")) {
    return `${origin}/bibliotech`;
  }

  return origin;
};

export const API_BASE = getBaseUrl();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getBaseUrl };
}
