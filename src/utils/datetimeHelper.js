export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const vnDate = new Date(date.getTime());

  const pad = (n) => (n < 10 ? '0' + n : n);

  const day = pad(vnDate.getDate());
  const month = pad(vnDate.getMonth() + 1);
  const year = vnDate.getFullYear();
  const hours = pad(vnDate.getHours());
  const minutes = pad(vnDate.getMinutes());
  const seconds = pad(vnDate.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
