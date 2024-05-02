'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Spots";
    await queryInterface.addColumn(
      options, "ownerId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Users" },
        allowNull: false,
        onDelete: 'CASCADE'
      }
    );
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Spots";
    await queryInterface.removeColumn(options, "ownerId");
  }
};
