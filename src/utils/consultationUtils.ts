// utils/consultationUtils.ts

export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDateLong = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const isCreatedToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'new': 'Baru',
    'greetings_sent': 'Email Terkirim',
    'follow_up_1_sent': 'Follow Up 1',
    'follow_up_2_sent': 'Follow Up 2',
    'follow_up_3_sent': 'Follow Up 3',
    'replied': 'Dibalas',
    'qualified': 'Qualified',
    'closed_won': 'Closed Won',
    'closed_lost': 'Closed Lost'
  };
  return labels[status] || status;
};

export const getCompanySizeLabel = (size: string): string => {
  return size;
};

export const getDaysAgo = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return '1 hari lalu';
  return `${diffDays} hari lalu`;
};