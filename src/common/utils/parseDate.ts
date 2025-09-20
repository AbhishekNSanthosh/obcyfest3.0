const parseDate = (str: string) => {
  const [day, month, year] = str.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day), 19, 0, 0);
};

export default parseDate;