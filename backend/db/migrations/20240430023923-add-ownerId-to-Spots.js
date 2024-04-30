'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Spots", "ownerId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Users" },
        allowNull: false
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Spots", "ownerId");
  }
};
