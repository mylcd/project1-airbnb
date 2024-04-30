'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "ReviewImages", "reviewId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Reviews" },
        allowNull: false
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("ReviewImages", "reviewId");
  }
};
