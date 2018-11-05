const fs = require('fs');
const path = require('path');
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
  let res = await basic.findAll({
    attributes: [
      'id',
      'data',
      'row',
      'col',
      'num',
      'classify'
    ],
    raw: true,
  });
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(res, null, 2), { encoding: 'utf-8' });
  console.warn('end');
}
exec();
