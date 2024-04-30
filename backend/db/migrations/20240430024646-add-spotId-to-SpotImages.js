'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "SpotImages", "spotId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Spots" },
        allowNull: false
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("SpotImages", "spotId");
  }
};
