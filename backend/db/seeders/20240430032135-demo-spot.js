'use strict';

const { Spot, User } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const spots = [
  {
    address: "123 Disney Lane",
    city: "San Francisco",
    state: "California",
    country: "United States of America",
    lat: 37.7645358,
    lng: -122.4730327,
    name: "App Academy",
    description: "Place where web developers are created",
    price: 123,
    username: "mylcd"
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      for (let spot of spots) {
        const { address, city, state, country, lat, lng, name, description, price } = spot;
        const foundUser = await User.findOne({
          where: { username: spot.username }
        });
        await Spot.create({
          address, city, state, country, lat, lng, name, description, price,
          ownerId: foundUser.id
        }, { validate: true });
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,
      {name: { [Op.in]: ['App Academy'] }},
    {});
  }
};
