'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const config = require('./config');
let basic = require('../website/app/model/layout/basic');
let junior = require('../website/app/model/layout/junior');
let row = require('../website/app/model/layout/row');
let col = require('../website/app/model/layout/col');

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
  junior = junior({
    Sequelize,
    model: {
      layout: sequelize,
    },
  });
  row = row({
    Sequelize,
    model: {
      layout: sequelize,
    },
  });
  col = col({
    Sequelize,
    model: {
      layout: sequelize,
    },
  });
  let basicData = await basic.findAll({
    attributes: [
      'id',
      'data',
      'num',
      'direction',
      'classify'
    ],
    raw: true,
  });
  fs.writeFileSync(path.join(__dirname, 'basic.json'), JSON.stringify(basicData, null, 2), { encoding: 'utf-8' });
  let juniorData = await junior.findAll({
    attributes: [
      'id',
      'data',
      'classify'
    ],
    raw: true,
  });
  fs.writeFileSync(path.join(__dirname, 'junior.json'), JSON.stringify(juniorData, null, 2), { encoding: 'utf-8' });
  let rowData = await row.findAll({
    attributes: [
      'id',
      'data',
      'row',
      'col',
      'classify'
    ],
    raw: true,
  });
  fs.writeFileSync(path.join(__dirname, 'row.json'), JSON.stringify(rowData, null, 2), { encoding: 'utf-8' });
  let colData = await col.findAll({
    attributes: [
      'id',
      'data',
      'row',
      'col',
      'classify'
    ],
    raw: true,
  });
  fs.writeFileSync(path.join(__dirname, 'col.json'), JSON.stringify(colData, null, 2), { encoding: 'utf-8' });

  console.warn('end');
}
exec();
