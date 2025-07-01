const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0]; // subdomain.school.com
  }
  return null; // no subdomain
};

const subdomain = getSubdomain();
