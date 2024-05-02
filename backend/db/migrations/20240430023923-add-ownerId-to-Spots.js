'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Spots", "ownerId",
      {
        type: Sequelize.INTEGER,
        references: { model: "Users" },
        allowNull: false
      }, options
    );
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Spots";
    await queryInterface.removeColumn(options, "ownerId");
  }
};
