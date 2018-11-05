const tf = require('@tensorflow/tfjs');
const Sequelize = require('sequelize');

const config = require('./config');
const data = require('./data.json');

const x = [];
const y = [];
data.forEach(item => {
  let { data, classify } = item;

  let t0 = data[0].type > 0;
  let t1 = data[1].type > 0;
  let t2 = data[2].type > 0;
  let t3 = data[3] ? data[3].type > 0 : null;
  let typeH = ((t0 === t1 ? 1 : 0) + (t2 === t3 ? 1 : 0)) / 2;
  let typeV = ((t0 === t2 ? 1 : 0) + (t1 === t3 ? 1 : 0)) / 2;

  let x0 = data[0].x + data[0].width;
  let x1 = data[1].x;
  let x2 = data[2].x + data[2].width;
  let x3 = data[3] ? data[3].x : x1;
  let y0 = data[0].y + data[0].height;
  let y1 = data[1].y + data[1].height;
  let y2 = data[2].y;
  let y3 = data[3] ? data[3].y : y2;
  let distanceH = Math.min(x1, x3) - Math.max(x0, x2);
  let distanceV = Math.min(y2, y3) - Math.max(y0, y1);

  let alignHStart0 = (Math.abs(data[0].y - data[1].y) < 1) ? 1 : 0;
  let alignHCenter0 = (Math.abs(data[0].y + data[0].height / 2 - data[1].y - data[1].height / 2) < 1) ? 1 : 0;
  let alignHEnd0 = (Math.abs(data[0].y + data[0].height - data[1].y - data[1].height) < 1) ? 1 : 0;
  let alignHStart1 = 1;
  let alignHCenter1 = 1;
  let alignHEnd1 = 1;
  if(data[3]) {
    alignHStart1 = (Math.abs(data[2].y - data[3].y) < 1) ? 1 : 0;
    alignHCenter1 = (Math.abs(data[2].y + data[2].height / 2 - data[3].y - data[3].height / 2) < 1) ? 1 : 0;
    alignHEnd1 = (Math.abs(data[2].y + data[2].height - data[3].y - data[3].height) < 1) ? 1 : 0;
  }
  let alignVStart0 = (Math.abs(data[0].x - data[2].x) < 1) ? 1 : 0;
  let alignVCenter0 = (Math.abs(data[0].x + data[2].width / 2 - data[2].x - data[2].width / 2) < 1) ? 1 : 0;
  let alignVEnd0 = (Math.abs(data[0].x + data[0].width - data[2].x - data[2].width) < 1) ? 1 : 0;
  let alignVStart1 = 1;
  let alignVCenter1 = 1;
  let alignVEnd1 = 1;
  if(data[3]) {
    alignVStart1 = (Math.abs(data[1].x - data[3].x) < 1) ? 1 : 0;
    alignVCenter1 = (Math.abs(data[1].x + data[1].width / 2 - data[3].x - data[3].width / 2) < 1) ? 1 : 0;
    alignVEnd1 = (Math.abs(data[1].x + data[1].width - data[3].x - data[3].width) < 1) ? 1 : 0;
  }
  let alignH = (alignHStart0 + alignHCenter0 + alignHEnd0 + alignHStart1 + alignHCenter1 + alignHEnd1) / 6;
  let alignV = (alignVStart0 + alignVCenter0 + alignVEnd0 + alignVStart1 + alignVCenter1 + alignVEnd1) / 6;

  x.push([
    typeH - typeV,
    distanceH - distanceV,
    alignH - alignV
  ]);
  y.push(classify);
});

const xs = tf.tensor2d(x);
const ys = tf.tensor2d(y, [y.length, 1]);

const w = tf.variable(tf.zeros([3, 1]));
const b = tf.variable(tf.scalar(0));

const f = x => {
  const h = tf.matMul(x, w).add(b);
  return tf.sigmoid(h);
};
const loss = (pred, label) => {
  const s0 = tf.log(pred);
  const cost0 = s0.transpose().matMul(label);
  const s1 = tf.log(pred.mul(-1).add(1));
  const cost1 = s1.transpose().matMul(label.mul(-1).add(1));
  const cost = cost0.add(cost1);
  return cost.div(-data.length).sum();
};

const learningRate = 0.01;
const optimizer = tf.train.adam(learningRate);

for(let i = 0; i < 1000; i++) {
  optimizer.minimize(() => {
    const lossVar = loss(f(xs), ys);
    lossVar.print();
    return lossVar;
  });
}

w.print();
b.print();


let basic = require('./model/layout/basic');
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

let count = 0;
data.forEach(item => {
  let { data, classify, id } = item;

  let t0 = data[0].type > 0;
  let t1 = data[1].type > 0;
  let t2 = data[2].type > 0;
  let t3 = data[3] ? data[3].type > 0 : null;
  let typeH = ((t0 === t1 ? 1 : 0) + (t2 === t3 ? 1 : 0)) / 2;
  let typeV = ((t0 === t2 ? 1 : 0) + (t1 === t3 ? 1 : 0)) / 2;

  let x0 = data[0].x + data[0].width;
  let x1 = data[1].x;
  let x2 = data[2].x + data[2].width;
  let x3 = data[3] ? data[3].x : x1;
  let y0 = data[0].y + data[0].height;
  let y1 = data[1].y + data[1].height;
  let y2 = data[2].y;
  let y3 = data[3] ? data[3].y : y2;
  let distanceH = Math.min(x1, x3) - Math.max(x0, x2);
  let distanceV = Math.min(y2, y3) - Math.max(y0, y1);

  let alignHStart0 = (Math.abs(data[0].y - data[1].y) < 1) ? 1 : 0;
  let alignHCenter0 = (Math.abs(data[0].y + data[0].height / 2 - data[1].y - data[1].height / 2) < 1) ? 1 : 0;
  let alignHEnd0 = (Math.abs(data[0].y + data[0].height - data[1].y - data[1].height) < 1) ? 1 : 0;
  let alignHStart1 = 1;
  let alignHCenter1 = 1;
  let alignHEnd1 = 1;
  if(data[3]) {
    alignHStart1 = (Math.abs(data[2].y - data[3].y) < 1) ? 1 : 0;
    alignHCenter1 = (Math.abs(data[2].y + data[2].height / 2 - data[3].y - data[3].height / 2) < 1) ? 1 : 0;
    alignHEnd1 = (Math.abs(data[2].y + data[2].height - data[3].y - data[3].height) < 1) ? 1 : 0;
  }
  let alignVStart0 = (Math.abs(data[0].x - data[2].x) < 1) ? 1 : 0;
  let alignVCenter0 = (Math.abs(data[0].x + data[2].width / 2 - data[2].x - data[2].width / 2) < 1) ? 1 : 0;
  let alignVEnd0 = (Math.abs(data[0].x + data[0].width - data[2].x - data[2].width) < 1) ? 1 : 0;
  let alignVStart1 = 1;
  let alignVCenter1 = 1;
  let alignVEnd1 = 1;
  if(data[3]) {
    alignVStart1 = (Math.abs(data[1].x - data[3].x) < 1) ? 1 : 0;
    alignVCenter1 = (Math.abs(data[1].x + data[1].width / 2 - data[3].x - data[3].width / 2) < 1) ? 1 : 0;
    alignVEnd1 = (Math.abs(data[1].x + data[1].width - data[3].x - data[3].width) < 1) ? 1 : 0;
  }
  let alignH = (alignHStart0 + alignHCenter0 + alignHEnd0 + alignHStart1 + alignHCenter1 + alignHEnd1) / 6;
  let alignV = (alignVStart0 + alignVCenter0 + alignVEnd0 + alignVStart1 + alignVCenter1 + alignVEnd1) / 6;

  let x = [
    [
      typeH - typeV,
      distanceH - distanceV,
      alignH - alignV
    ]
  ];

  let res = f(x);
  let forecast = res.get(0, 0) >= 0.5 ? 1 : 0;
  if(forecast === classify) {
    count++;
  }
  basic.update({
    forecast,
  }, {
    where: {
      id,
    },
  });
});

console.warn('正确率', count / data.length);
