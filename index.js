const fs = require('fs');
const tf = require('@tensorflow/tfjs');
const Sequelize = require('sequelize');

const config = require('./config');
let basic = require('./model/layout/basic');

async function exec() {
  let sequelize = new Sequelize('layout', config.db.username, config.db.password, {
    host: config.db.host,
    dialect: 'mysql',
    define: {
      freezeTableName: true,
      underscored: true,
      timestamps: false,
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci',
      },
    },
  });
  basic = basic({
    Sequelize,
    model: {
      layout: sequelize,
    },
  });

}
exec();
