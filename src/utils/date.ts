export const getDateKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isYesterday = (dateKey: string, todayKey = getDateKey()): boolean => {
  if (!dateKey) {
    return false;
  }

  const today = new Date(`${todayKey}T00:00:00`);
  const previous = new Date(today);
  previous.setDate(today.getDate() - 1);
  return getDateKey(previous) === dateKey;
};

export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "时间未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
