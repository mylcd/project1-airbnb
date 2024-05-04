'use strict';

const { Review, Spot, User } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const reviews = [
  {
    review: "This was an awesome spot!",
    stars: 5,
    spotname: "App Academy",
    username: "FakeUser2"
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      for (let reviewInfo of reviews) {
        const { review, stars } = reviewInfo;
        const foundUser = await User.findOne({
          where: { username: reviewInfo.username }
        });
        const foundSpot = await Spot.findOne({
          where: { name: reviewInfo.spotname }
        });
        await Review.create({
          review, stars,
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
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,
      {review: { [Op.in]: ['This was an awesome spot!'] }},
    {});
  }
};
