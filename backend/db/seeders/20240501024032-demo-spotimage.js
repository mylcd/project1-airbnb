'use strict';

const { Spot, SpotImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const spotimages = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/49/A_black_image.jpg",
    preview: true,
    spotname: "App Academy"
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      for (let spotimage of spotimages) {
        const { url, preview } = spotimage;
        const foundSpot = await Spot.findOne({
          where: { name: spotimage.spotname }
        });
        await SpotImage.create({
          url, preview,
          spotId: foundSpot.id
        });
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,
      { url: spotimages.map(spotimage => spotimage.url) },
      //{url: { [Op.in]: ["https://upload.wikimedia.org/wikipedia/commons/4/49/A_black_image.jpg"] }},
    {});
  }
};
