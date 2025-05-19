const getBaseUrl = () => {
  const origin = window.location.origin;
  const path = window.location.pathname;

  // Handle various deployment scenarios
  if (path.includes("/bibliotech/view/")) {    
    return `${origin}/bibliotech`;
  } else if (path.includes("/bibliotech")) {    
    return `${origin}/bibliotech`;
  }

  return origin;
};

// Export API_BASE for backwards compatibility
export const API_BASE = getBaseUrl();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getBaseUrl };
}
