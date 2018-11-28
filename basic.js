'use strict';

const tf = require('@tensorflow/tfjs');
const model = require('./model/basic');

const dataes = require('./basic.json');

const xh = [];
const xv = [];
const yh = [];
const yv = [];

dataes.forEach(item => {
  let { data, direction, classify } = item;
  if(direction) {
    xh.push(model(data, direction));
    yh.push(classify);
  }
  else {
    xv.push(model(data, direction));
    yv.push(classify);
  }
});

const xhs = tf.tensor2d(xh);
const yhs = tf.tensor2d(yh, [yh.length, 1]);
const xvs = tf.tensor2d(xv);
const yvs = tf.tensor2d(yv, [yv.length, 1]);

const wh = tf.variable(tf.zeros([11, 1]));
const bh = tf.variable(tf.scalar(0));
const wv = tf.variable(tf.zeros([11, 1]));
const bv = tf.variable(tf.scalar(0));

const fh = x => {
  const h = tf.matMul(x, wh).add(bh);
  return tf.sigmoid(h);
};
const fv = x => {
  const h = tf.matMul(x, wv).add(bv);
  return tf.sigmoid(h);
};
const loss = (pred, label, count) => {
  const s0 = tf.log(pred);
  const cost0 = s0.transpose().matMul(label);
  const s1 = tf.log(pred.mul(-1).add(1));
  const cost1 = s1.transpose().matMul(label.mul(-1).add(1));
  const cost = cost0.add(cost1);
  return cost.div(-count).sum();
};

const learningRate = 0.1;
const optimizer = tf.train.adam(learningRate);
const optimizer2 = tf.train.adam(learningRate);

for(let i = 0; i < 1000; i++) {
  optimizer.minimize(() => {
    const lossVar = loss(fh(xhs), yhs, yh.length);
    lossVar.print();
    return lossVar;
  });
  optimizer2.minimize(() => {
    const lossVar = loss(fv(xvs), yvs, yv.length);
    lossVar.print();
    return lossVar;
  });
}

console.warn(wh.dataSync());
console.warn(bh.dataSync());
console.warn(wv.dataSync());
console.warn(bv.dataSync());

let count = 0;
let countH = 0;
let countV = 0;
let totalH = 0;
let totalV = 0;
let list = [];
dataes.forEach(item => {
  let { id, data, direction, classify } = item;
  if(direction) {
    totalH++;
  }
  else {
    totalV++;
  }
  let param = model(data, direction);
  let res = direction ? fh([param]) : fv([param]);
  let forecast = res.get(0, 0) >= 0.5 ? 1 : 0;
  if(forecast === classify) {
    count++;
    if(direction) {
      countH++;
    }
    else {
      countV++;
    }
  }
  else {
    list.push([id, direction]);
  }
});
console.warn(`总正确率：${count / dataes.length}，行正确率：${countH / totalH}，列正确率：${countV / totalV}`);
if(list.length) {
  console.table(list);
}
