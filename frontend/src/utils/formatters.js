import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  try { return format(new Date(date), 'MMM d, yyyy'); }
  catch { return ''; }
};

export const formatRelativeDate = (date) => {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return ''; }
};

export const readTime = (content = '') => {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const excerpt = (content = '', maxLen = 150) => {
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
};

export const avatarUrl = (name = 'U') => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=001f3f&color=fed65b&bold=true&size=128`;
};
