'use strict';

const tf = require('@tensorflow/tfjs');

const dataes = require('./basic.json');

function parse(data, direction) {
  let length = data.length;
  let tt = 0; // 类型
  let dt = 0; // 间距
  let wt = 0; // 宽度
  let ht = 0; // 高度
  let ast = 0; // 开始对齐
  let act = 0; // 中间对齐
  let aet = 0; // 结尾对齐
  let ft = 0; // 字体大小
  let lt = 0; // 行高
  data.forEach((item, i) => {
    tt += item.type;
    wt += item.width;
    ht += item.height;
    ft += item.fontSize;
    lt += item.lineHeight;
    if(i) {
      let prev = data[i - 1];
      if(direction) {
        dt += item.x - prev.x - prev.width;
      }
      else {
        dt += item.y - prev.y - prev.height;
      }
    }
    if(direction) {
      ast += item.y;
      act += (item.y + item.height) * 0.5;
      aet += item.y + item.height;
    }
    else {
      ast += item.x;
      act += (item.x + item.width) * 0.5;
      aet += item.x + item.width;
    }
  });
  let ta = tt / length;
  let wa = wt / length;
  let ha = ht / length;
  let asa = ast / length;
  let aca = act / length;
  let aea = aet / length;
  let fa = ft / length;
  let la = lt / length;
  let t = 0;
  let da = 0;
  let d = 0;
  let w = 0;
  let h = 0;
  let as = 0;
  let ac = 0;
  let ae = 0;
  let f = 0;
  let l = 0;
  if(direction) {
    da = dt / (length - 1);
  }
  else {
    da = dt / (length - 1);
  }
  data.forEach((item, i) => {
    t += Math.abs(item.type - ta);
    w += Math.abs(item.width - wa);
    h += Math.abs(item.height - ha);
    f += Math.abs(item.fontSize - fa);
    l += Math.abs(item.lineHeight - la);
    if(direction) {
      as += Math.abs(item.y - asa);
      ac += Math.abs((item.y + item.height) * 0.5 - aca);
      ae += Math.abs(item.y + item.height - aea);
    }
    else {
      as += Math.abs(item.x - asa);
      ac += Math.abs((item.x + item.width) * 0.5 - aca);
      ae += Math.abs(item.x + item.width - aea);
    }
    if(i) {
      let prev = data[i - 1];
      if(direction) {
        let n = item.x - prev.x - prev.width;
        d += Math.abs(n - da);
      }
      else {
        let n = item.y - prev.y - prev.height;
        d += Math.abs(n - da);
      }
    }
  });
  t /= tt;
  if(tt === 0) {
    t = 0;
  }
  t /= length;
  d /= dt;
  w /= wt;
  h /= ht;
  as /= ast;
  if(ast === 0) {
    as = 0;
  }
  ac /= act;
  if(act === 0) {
    ac = 0;
  }
  ae /= aet;
  if(aet === 0) {
    ae = 0;
  }
  f /= ft;
  if(ft === 0) {
    f = 0;
  }
  f /= length;
  l /= lt;
  if(lt === 0) {
    l = 0;
  }
  l /= length;
  let dn = da / length; // 间距数量比
  let dp = 0; //间距占总比
  if(direction) {
    dp = dt / (data[length - 1].x + data[length - 1].width);
  }
  else {
    dp = dt / (data[length - 1].y + data[length - 1].height);
  }
  return [t, dp, d, dn, w, h, as, ac, ae, f, l];
}

const xh = [];
const xv = [];
const yh = [];
const yv = [];

dataes.forEach(item => {
  let { data, direction, classify } = item;
  if(direction) {
    xh.push(parse(data, direction));
    yh.push(classify);
  }
  else {
    xv.push(parse(data, direction));
    yv.push(classify);
  }
});

// console.table(xh); console.table(xv);

const xhs = tf.tensor2d(xh);
const yhs = tf.tensor2d(yh, [yh.length, 1]);
const xvs = tf.tensor2d(xv);
const yvs = tf.tensor2d(yv, [yv.length, 1]);

// xhs.print(); yhs.print(); xvs.print(); yvs.print();

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

wh.print();
bh.print();
wv.print();
bv.print();

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
  let param = parse(data, direction);
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
