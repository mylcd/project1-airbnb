'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Bookings", "spotId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Spots" },
        allowNull: false
      }
    );
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Bookings";
    await queryInterface.removeColumn(options, "spotId");
  }
};
