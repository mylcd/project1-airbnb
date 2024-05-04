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

const validateDateInBetween = (startDate, endDate, bookings) => {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  for(let booking of bookings) {
    let bookingstart = Date.parse(booking.startDate.toISOString());
    if(bookingstart >= start && bookingstart <= end) return false;
  }
  return true;
};

const userNonEmpty = (req, res, next) => {
  if(req.user == null) {
    res.status(403);
      return res.json({
        message: "Forbidden"
      });
  }
  else next();
}


module.exports = {
  toDateString,
  toDateTimeString,
  validateDate,
  validateDateInBetween,
  userNonEmpty
};
