const toDateString = datetime => datetime.toISOString().split('T')[0];

const toDateTimeString = datetime => {
  const firstSplit = datetime.toISOString().split('T');
  let date = firstSplit[0];
  let time = firstSplit[1].split('.')[0]
  return date + ' ' + time;
}

const validateDate = (date, bookings) => {
  const currentdate = Date.parse(date);
  for(let booking of bookings) {
    let start = Date.parse(booking.startDate.toISOString());
    let end = Date.parse(booking.endDate.toISOString());
    if(currentdate >= start &&  currentdate <= end) return false;
  }
  return true;
};

module.exports = { toDateString, toDateTimeString, validateDate };
