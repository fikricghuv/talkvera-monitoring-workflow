// utils/crmUtils.ts

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateLong = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isCreatedToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const getLifecycleStageLabel = (stage: string): string => {
  const labels: Record<string, string> = {
    'lead': 'Lead',
    'qualified': 'Qualified',
    'customer': 'Customer',
    'inactive': 'Inactive'
  };
  return labels[stage] || stage;
};

export const getLeadStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'new': 'New',
    'in_progress': 'In Progress',
    'follow_up': 'Follow Up',
    'closed_won': 'Closed Won',
    'closed_lost': 'Closed Lost'
  };
  return labels[status] || status;
};

export const getSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    'landing_page': 'Landing Page',
    'whatsapp': 'WhatsApp',
    'manual': 'Manual'
  };
  return labels[source] || source;
};