const getBaseUrl = () => {
  const origin = window.location.origin;
  const path = window.location.pathname;

  if (path.includes("/bibliotech")) {
    return `${origin}/bibliotech/public`;
  }

  return `${origin}/public`;
};

export const API_BASE = getBaseUrl();
