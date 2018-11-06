const tf = require('@tensorflow/tfjs');
const Sequelize = require('sequelize');

const config = require('./config');
const data = require('./data.json');

function parse(data) {
  let t0 = Math.min(data[0].type, 1);
  let t1 = Math.min(data[1].type, 1);
  let t2 = Math.min(data[2].type, 1);
  let t3 = data[3] ? Math.min(data[3].type, 1) : null;
  let typeH;
  let typeV;
  if(data[3]) {
    typeH = (Math.abs(t0 - t1) + Math.abs(t2 - t3)) / 2;
    typeV = (Math.abs(t0 - t2) + Math.abs(t1 - t3)) / 2;
  }
  else {
    typeH = Math.abs(t0 - t1) / 2;
    typeV = Math.abs(t1 - t2) / 2;
  }

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
  let distanceTotal = distanceH + distanceV;
  distanceH /= distanceTotal;
  distanceV /= distanceTotal;

  let area0 = data[0].width * data[0].height;
  let area1 = data[1].width * data[1].height;
  let area2 = data[2].width * data[2].height;
  let area3 = data[3] ? (data[3].width * data[3].height) : 0;
  let areaH;
  let areaV;
  if(area3) {
    // 横竖面积比，始终取小值为分子，使得相似度忽略方向
    let areaProportionH0 = Math.min(area0, area1) / Math.max(area0, area1);
    let areaProportionH1 = Math.min(area2, area3) / Math.max(area2, area3);
    let areaProportionH = Math.abs(areaProportionH0 - areaProportionH1);
    let areaProportionV0 = Math.min(area0, area2) / Math.max(area0, area2);
    let areaProportionV1 = Math.min(area1, area3) / Math.max(area1, area3);
    let areaProportionV = Math.abs(areaProportionV0 - areaProportionV1);
    let areaTotal = area0 + area1 + area2 + area3;
    // 横竖面积差
    let areaDiffH = Math.abs(area0 + area1 - area2 - area3) / areaTotal;
    let areaDiffV = Math.abs(area0 + area2 - area1 - area3) / areaTotal;
    areaH = areaProportionH + areaDiffH;
    areaV = areaProportionV + areaDiffV;
  }
  else {
    // 缺1个只有单行单列，直接对比相似度
    areaH = Math.abs(area0 - area1) / (area0 + area1);
    areaV = Math.abs(area0 - area2) / (area0 + area2);
  }

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

  return [
    typeH - typeV,
    distanceH - distanceV,
    areaH - areaV,
    alignH - alignV
  ];
}

const x = [];
const y = [];
data.forEach(item => {
  let { data, classify } = item;
  x.push(parse(data));
  y.push(classify);
});

const xs = tf.tensor2d(x);
const ys = tf.tensor2d(y, [y.length, 1]); xs.print(); ys.print();

const w = tf.variable(tf.zeros([4, 1]));
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

const learningRate = 0.001;
const optimizer = tf.train.adam(learningRate);

for(let i = 0; i < 5000; i++) {
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
  let x = parse(data);
  let res = f([x]);
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
