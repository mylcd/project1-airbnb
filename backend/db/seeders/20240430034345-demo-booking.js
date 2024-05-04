'use strict';

const { Booking, Spot, User } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const bookings = [
  {
    startDate: "2099-12-30",
    endDate: "2099-12-31",
    spotname: "App Academy",
    username: "FakeUser2"
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      for (let booking of bookings) {
        const { startDate, endDate } = booking;
        const foundUser = await User.findOne({
          where: { username: booking.username }
        });
        const foundSpot = await Spot.findOne({
          where: { name: booking.spotname }
        });
        await Booking.create({
          startDate, endDate,
          userId: foundUser.id,
          spotId: foundSpot.id
        }, { validate: true });
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,
      {endDate: { [Op.in]: ["2099-12-31"] }},
    {});
  }
};
