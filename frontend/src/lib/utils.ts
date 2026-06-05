export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const getInitials = (email: string) => {
  return email
    .split('@')[0]
    .split('.')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateSlug = (slug: string) => {
  const slugRegex = /^[a-zA-Z0-9-]{3,50}$/;
  return slugRegex.test(slug);
};
