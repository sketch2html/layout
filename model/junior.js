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
  1.4430301189422607,
  0.6951603293418884,
  -0.20091697573661804,
  -1.3960137367248535,
  0.9645492434501648,
  0.6312721967697144,
  0.9975471496582031,
  -2.8683295249938965,
  -1.6589916944503784,
  -7.5311279296875,
  -3.8714444637298584,
  1.513302206993103,
  1.7055970430374146,
  -8.049519538879395,
  -7.765089988708496,
  -7.484204292297363,
  -10.79858684539795,
  -10.414084434509277,
  -10.290769577026367,
  -6.17625093460083,
  -6.636294841766357,
  -7.162513256072998,
  -11.630932807922363 ], [23, 1]));
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
    let res = f([param], wv, bv);
    nClassify = res.get(0, 0);
  }
  return [classify >= 0.5 ? 1 : 0, nClassify >= 0.5 ? 1 : 0, classify, nClassify];
};
