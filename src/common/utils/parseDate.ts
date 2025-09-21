const parseDate = (str: string) => {
  const [day, month, year] = str.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
};

export default parseDate;