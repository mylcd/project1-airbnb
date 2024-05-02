'use strict';

const { Review, ReviewImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const reviewimages = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/49/A_black_image.jpg",
    review: "This was an awesome spot!"
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      for (let reviewimage of reviewimages) {
        const { url } = reviewimage;
        const foundReview = await Review.findOne({
          where: { review: reviewimage.review }
        });
        await ReviewImage.create({
          url,
          reviewId: foundReview.id
        }, { validate: true });
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,
      {url: { [Op.in]: ["https://upload.wikimedia.org/wikipedia/commons/4/49/A_black_image.jpg"] }},
    {});
  }
};
