'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Bookings", "userId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Users" },
        allowNull: false
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Bookings", "userId");
  }
};
