export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};

export const formatNumber = (num: number | undefined | null, decimals = 0): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (decimals > 0) {
    return num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  return num.toLocaleString('en-IN');
};

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};

export const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'resolved':
    case 'delivered':
    case 'paid':
    case 'verified':
    case 'excellent':
    case 'passed':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
      };
    case 'in progress':
    case 'harvesting':
    case 'partially delivered':
    case 'partially paid':
    case 'approved':
    case 'good':
      return {
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-600',
      };
    case 'pending approval':
    case 'pending review':
    case 'pending verification':
    case 'under review':
    case 'assigned':
    case 'scheduled':
    case 'moderate':
    case 'medium':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-600',
      };
    case 'draft':
    case 'low':
      return {
        bg: 'bg-stone-100 text-stone-700 border-stone-200',
        dot: 'bg-stone-500',
      };
    case 'cancelled':
    case 'rejected':
    case 'overdue':
    case 'critical':
    case 'high':
    case 'poor':
    case 'disputed':
    case 'failed':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-600',
      };
    default:
      return {
        bg: 'bg-stone-50 text-stone-700 border-stone-200',
        dot: 'bg-stone-500',
      };
  }
};
