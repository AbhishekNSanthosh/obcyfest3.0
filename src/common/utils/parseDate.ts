const parseDate = (str: string,hours:Number=9,minutes:Number=0) => {
  const [day, month, year] = str.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), 0);
};

export default parseDate;