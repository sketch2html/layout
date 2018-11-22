'use strict';

const tf = require('@tensorflow/tfjs');
const model = require('./model/col');

const dataes = require('./col.json');

const x = [];
const y = [];

dataes.forEach(item => {
  let { data, classify, row, col } = item;
  x.push(model(data, row, col));
  y.push(classify);
});

const xs = tf.tensor2d(x);
const ys = tf.tensor2d(y, [y.length, 1]);

const w = tf.variable(tf.zeros([22, 1]));
const b = tf.variable(tf.scalar(0));

const f = (x, w, b) => {
  const h = tf.matMul(x, w).add(b);
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

for(let i = 0; i < 300; i++) {
  optimizer.minimize(() => {
    const lossVar = loss(f(xs, w, b), ys, y.length);
    lossVar.print();
    return lossVar;
  });
}

console.warn(w.dataSync());
console.warn(b.dataSync());

let count = 0;
let list = [];
dataes.forEach(item => {
  let {id, data, classify, row, col} = item;
  let param = model(data, row, col);
  let res = f([param], w, b);
  let forecast = res.get(0, 0) >= 0.5 ? 1 : 0;
  if(forecast === classify) {
    count++;
  }
  else {
    list.push([id, classify, forecast]);
  }
});
console.warn(`正确率：${count / dataes.length}`);
if(list.length) {
  console.table(list);
}
