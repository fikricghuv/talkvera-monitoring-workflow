export const formatDate = (date: Date, format: string = "short"): string => {
  if (format === "short") {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${day} ${monthNames[date.getMonth()]}`;
  }
  return date.toLocaleDateString('id-ID');
};

export const getInitialCustomDates = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
};