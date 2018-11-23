'use strict';

const tf = require('@tensorflow/tfjs');
const modelRow = require('./row');
const modelCol = require('./col');

const f = (x, w, b) => {
  const h = tf.matMul(x, w).add(b);
  return tf.sigmoid(h);
};

const wh = tf.variable(tf.tensor2d([
  2.0083255767822266,
  -0.31791117787361145,
  4.045642852783203,
  -1.289065957069397,
  1.1820979118347168,
  4.138618469238281,
  -9.261831283569336,
  -2.3883020877838135,
  -0.2694131135940552,
  -10.655627250671387,
  -12.047514915466309,
  -4.3455939292907715,
  -5.0233917236328125,
  -3.6735353469848633,
  -1.5828726291656494,
  -0.293669730424881,
  -12.498136520385742,
  -12.861517906188965,
  -11.180801391601562,
  -5.988503932952881,
  -6.46907901763916,
  -6.544981002807617,
  -13.467001914978027 ], [23, 1]));
const bh = tf.variable(tf.scalar(-3.7541027069091797));

const wv = tf.variable(tf.tensor2d([
  1.5054407119750977,
  0.6695924401283264,
  -0.08231235295534134,
  -1.4115991592407227,
  0.9765197038650513,
  0.7088986039161682,
  0.9909523725509644,
  -2.8496453762054443,
  -1.732830286026001,
  -7.792357444763184,
  -4.637592792510986,
  -0.018033400177955627,
  -0.0623696893453598,
  -8.232069969177246,
  -7.8244171142578125,
  -7.400270938873291,
  -10.580523490905762,
  -10.229599952697754,
  -10.089300155639648,
  -6.248934745788574,
  -6.725739002227783,
  -7.304223537445068,
  -11.51648998260498 ], [23, 1]));
const bv = tf.variable(tf.scalar(-1.3821392059326172));

module.exports = function(data, row, col, direction, area, directions) {
  let classify = 0;
  // 行
  if(direction === 0) {
    let param = modelRow(data, row, col);
    let res = f([param], wh, bh);
    classify = res.get(0, 0);
  }
  // 列
  else {
    let param = modelCol(data, row, col);
    let res = f([param], wv, bv);
    classify = res.get(0, 0);
  }
  let nRow = area.length;
  let nCol = area[0].length;
  let nData = [];
  area.forEach(list => {
    list.forEach(i => {
      nData.push(data[i]);
    });
  });
  let nClassify = 0;
  if(directions === 0) {
    let param = modelRow(nData, nRow, nCol);
    let res = f([param], wh, bh);
    nClassify = res.get(0, 0);
  }
  else {
    let param = modelCol(nData, nRow, nCol);
    let res = f([param], wh, bh);
    nClassify = res.get(0, 0);
  }
  return [classify >= 0.5 ? 1 : 0, nClassify >= 0.5 ? 1 : 0, classify, nClassify];
};
