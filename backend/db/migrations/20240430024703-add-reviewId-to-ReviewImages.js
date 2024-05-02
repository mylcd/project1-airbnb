'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "ReviewImages", "reviewId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Reviews" },
        allowNull: false
      }, options
    );
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "ReviewImages";
    await queryInterface.removeColumn(options, "reviewId");
  }
};
