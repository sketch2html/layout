'use strict';

const tf = require('@tensorflow/tfjs');

const dataes = require('./junior.json');

function parseR(data) {
  let [a, b, c, d] = data;
  // 水平对齐一致性
  let alignHStart0 = (Math.abs(a.y - b.y) < 3) ? 1 : 0;
  let alignHCenter0 = (Math.abs(a.y + a.height / 2 - b.y - b.height / 2) < 3) ? 1 : 0;
  let alignHEnd0 = (Math.abs(a.y + a.height - b.y - b.height) < 3) ? 1 : 0;
  let alignHStart1 = (Math.abs(c.y - d.y) < 3) ? 1 : 0;
  let alignHCenter1 = (Math.abs(c.y + c.height / 2 - d.y - d.height / 2) < 3) ? 1 : 0;
  let alignHEnd1 = (Math.abs(c.y + c.height - d.y - d.height) < 3) ? 1 : 0;
  let alignH0 = (alignHStart0 + alignHCenter0 + alignHEnd0) > 0 ? 1 : 0;
  let alignH1 = (alignHStart1 + alignHCenter1 + alignHEnd1) > 0 ? 1 : 0;
  let alignH = (alignH0 + alignH1) * 0.5;
  // 间距比
  let height = Math.max(c.y + c.height, d.y + d.height);
  let distance = Math.min(c.y, d.y) - Math.max(a.y + a.height, b.y + b.height);

  return [alignH, distance / height];
}

function parseC(data) {
  let [a, b, c, d] = data;
  // 垂直对齐一致性
  let alignVStart0 = (Math.abs(a.x - c.x) < 3) ? 1 : 0;
  let alignVCenter0 = (Math.abs(a.x + a.width / 2 - c.x - c.width / 2) < 3) ? 1 : 0;
  let alignVEnd0 = (Math.abs(a.x + a.width - c.x - c.width) < 3) ? 1 : 0;
  let alignVStart1 = (Math.abs(b.x - d.x) < 3) ? 1 : 0;
  let alignVCenter1 = (Math.abs(b.x + b.width / 2 - d.x - d.width / 2) < 3) ? 1 : 0;
  let alignVEnd1 = (Math.abs(b.x + b.width - d.x - d.width) < 3) ? 1 : 0;
  let alignV0 = (alignVStart0 + alignVCenter0 + alignVEnd0) > 0 ? 1 : 0;
  let alignV1 = (alignVStart1 + alignVCenter1 + alignVEnd1) > 0 ? 1 : 0;
  let alignV = (alignV0 + alignV1) * 0.5;
  // 间距比
  let height = Math.max(c.y + c.height, d.y + d.height);
  let distance = Math.min(c.y, d.y) - Math.max(a.y + a.height, b.y + b.height);

  return [alignV, distance / height];
}

function parseR2(data) {
  let [a, b, c, d] = data;
  // 类型的行列一致性
  let t0 = a.type;
  let t1 = b.type;
  let t2 = c.type;
  let t3 = d.type;
  let typeH;
  if(t0 === t1 && t2 === t3 && t0 === t2) {
    typeH = 1;
  }
  else if(t0 === t1 && t2 === t3) {
    typeH = 0;
  }
  else if(t0 === t2 && t1 === t3) {
    typeH = 1;
  }
  // 交错的话水平有可能，垂直不可能
  else {
    typeH = 1;
  }
  // 对齐一致性
  let alignHStart0 = (Math.abs(a.y - b.y) < 3) ? 1 : 0;
  let alignHCenter0 = (Math.abs(a.y + a.height / 2 - b.y - b.height / 2) < 3) ? 1 : 0;
  let alignHEnd0 = (Math.abs(a.y + a.height - b.y - b.height) < 3) ? 1 : 0;
  let alignHStart1 = (Math.abs(c.y - d.y) < 3) ? 1 : 0;
  let alignHCenter1 = (Math.abs(c.y + c.height / 2 - d.y - d.height / 2) < 3) ? 1 : 0;
  let alignHEnd1 = (Math.abs(c.y + c.height - d.y - d.height) < 3) ? 1 : 0;
  let alignH0 = (alignHStart0 + alignHCenter0 + alignHEnd0) > 0 ? 1 : 0;
  let alignH1 = (alignHStart1 + alignHCenter1 + alignHEnd1) > 0 ? 1 : 0;
  let alignH = (alignH0 + alignH1) * 0.5;
  let alignVStart0 = (Math.abs(a.x - c.x) < 3) ? 1 : 0;
  let alignVCenter0 = (Math.abs(a.x + a.width / 2 - c.x - c.width / 2) < 3) ? 1 : 0;
  let alignVEnd0 = (Math.abs(a.x + a.width - c.x - c.width) < 3) ? 1 : 0;
  let alignVStart1 = (Math.abs(b.x - d.x) < 3) ? 1 : 0;
  let alignVCenter1 = (Math.abs(b.x + b.width / 2 - d.x - d.width / 2) < 3) ? 1 : 0;
  let alignVEnd1 = (Math.abs(b.x + b.width - d.x - d.width) < 3) ? 1 : 0;
  let alignDiff = (alignHStart0 + alignHCenter0 + alignHEnd0 + alignHStart1 + alignHCenter1 + alignHEnd1) / 6
    - (alignVStart0 + alignVCenter0 + alignVEnd0 + alignVStart1 + alignVCenter1 + alignVEnd1) / 6;
  // 间距比
  let height = Math.max(c.y + c.height, d.y + d.height);
  let distance = Math.min(c.y, d.y) - Math.max(a.y + a.height, b.y + b.height);
  // 宽一致性
  let widthProportionH0 = Math.min(a.width, b.width) / Math.max(a.width, b.width);
  let widthProportionH1 = Math.min(c.width, d.width) / Math.max(c.width, d.width);
  let widthProportionH = Math.abs(widthProportionH0 - widthProportionH1);
  let widthTotal = a.width + b.width + c.width + d.width;
  let widthDiffH = Math.abs(a.width + b.width - c.width - d.width) / widthTotal;
  let widthProportionV0 = Math.min(a.width, c.width) / Math.max(a.width, c.width);
  let widthProportionV1 = Math.min(b.width, d.width) / Math.max(b.width, d.width);
  let widthProportionV = Math.abs(widthProportionV0 - widthProportionV1);
  let widthDiffV = Math.abs(a.width + c.width - b.width - d.width) / widthTotal;
  // 高一致性
  let heightProportionH0 = Math.min(a.height, b.height) / Math.max(a.height, b.height);
  let heightProportionH1 = Math.min(c.height, d.height) / Math.max(c.height, d.height);
  let heightProportionH = Math.abs(heightProportionH0 - heightProportionH1);
  let heightTotal = a.height + b.height + c.height + d.height;
  let heightDiffH = Math.abs(a.height + b.height - c.height - d.height) / heightTotal;
  let heightProportionV0 = Math.min(a.height, c.height) / Math.max(a.height, c.height);
  let heightProportionV1 = Math.min(b.height, d.height) / Math.max(b.height, d.height);
  let heightProportionV = Math.abs(heightProportionV0 - heightProportionV1);
  let heightDiffV = Math.abs(a.height + c.height - b.height - d.height) / heightTotal;
  // 字体一致性
  let fontProportionH0 = Math.min(a.fontSize, b.fontSize) / Math.max(a.fontSize, b.fontSize);
  let fontProportionH1 = Math.min(c.fontSize, d.fontSize) / Math.max(c.fontSize, d.fontSize);
  if(isNaN(fontProportionH0)) {
    fontProportionH0 = 0;
  }
  if(isNaN(fontProportionH1)) {
    fontProportionH1 = 0;
  }
  let fontProportionH = Math.abs(fontProportionH0 - fontProportionH1);
  let fontTotal = a.fontSize + b.fontSize + c.fontSize + d.fontSize;
  let fontDiffH = Math.abs(a.fontSize + b.fontSize - c.fontSize - d.fontSize) / fontTotal;
  if(isNaN(fontDiffH)) {
    fontDiffH = 0;
  }
  //行高一致性
  let lineHeightProportionH0 = Math.min(a.lineHeight, b.lineHeight) / Math.max(a.lineHeight, b.lineHeight);
  let lineHeightProportionH1 = Math.min(c.lineHeight, d.lineHeight) / Math.max(c.lineHeight, d.lineHeight);
  if(isNaN(lineHeightProportionH0)) {
    lineHeightProportionH0 = 0;
  }
  if(isNaN(lineHeightProportionH1)) {
    lineHeightProportionH1 = 0;
  }
  let lineHeightProportionH = Math.abs(lineHeightProportionH0 - lineHeightProportionH1);
  let lineHeightTotal = a.lineHeight + b.lineHeight + c.lineHeight + d.lineHeight;
  let lineHeightDiffH = Math.abs(a.lineHeight + b.lineHeight - c.lineHeight - d.lineHeight) / lineHeightTotal;
  if(isNaN(lineHeightDiffH)) {
    lineHeightDiffH = 0;
  }

  return [
    typeH,
    alignH,
    alignDiff,
    distance / height,
    widthProportionH,
    widthDiffH,
    widthProportionV,
    widthDiffV,
    heightProportionH,
    heightDiffH,
    heightProportionV,
    heightDiffV,
    fontProportionH,
    fontDiffH,
    lineHeightProportionH,
    lineHeightDiffH
  ];
}

function parseC2(data) {
  let [a, b, c, d] = data;
  // 类型的行列一致性
  let t0 = a.type;
  let t1 = b.type;
  let t2 = c.type;
  let t3 = d.type;
  let typeV;
  if(t0 === t1 && t2 === t3 && t0 === t2) {
    typeV = 1;
  }
  else if(t0 === t1 && t2 === t3) {
    typeV = 1;
  }
  else if(t0 === t2 && t1 === t3) {
    typeV = 0;
  }
  // 交错的话水平有可能，垂直不可能
  else {
    typeV = 0;
  }
  // 对齐一致性
  let alignHStart0 = (Math.abs(a.y - b.y) < 3) ? 1 : 0;
  let alignHCenter0 = (Math.abs(a.y + a.height / 2 - b.y - b.height / 2) < 3) ? 1 : 0;
  let alignHEnd0 = (Math.abs(a.y + a.height - b.y - b.height) < 3) ? 1 : 0;
  let alignHStart1 = (Math.abs(c.y - d.y) < 3) ? 1 : 0;
  let alignHCenter1 = (Math.abs(c.y + c.height / 2 - d.y - d.height / 2) < 3) ? 1 : 0;
  let alignHEnd1 = (Math.abs(c.y + c.height - d.y - d.height) < 3) ? 1 : 0;
  let alignVStart0 = (Math.abs(a.x - c.x) < 3) ? 1 : 0;
  let alignVCenter0 = (Math.abs(a.x + a.width / 2 - c.x - c.width / 2) < 3) ? 1 : 0;
  let alignVEnd0 = (Math.abs(a.x + a.width - c.x - c.width) < 3) ? 1 : 0;
  let alignVStart1 = (Math.abs(b.x - d.x) < 3) ? 1 : 0;
  let alignVCenter1 = (Math.abs(b.x + b.width / 2 - d.x - d.width / 2) < 3) ? 1 : 0;
  let alignVEnd1 = (Math.abs(b.x + b.width - d.x - d.width) < 3) ? 1 : 0;
  let alignV0 = (alignVStart0 + alignVCenter0 + alignVCenter0) > 0 ? 1 : 0;
  let alignV1 = (alignVStart1 + alignVCenter1 + alignVCenter1) > 0 ? 1 : 0;
  let alignV = (alignV0 + alignV1) * 0.5;
  let alignDiff = (alignHStart0 + alignHCenter0 + alignHEnd0 + alignHStart1 + alignHCenter1 + alignHEnd1) / 6
    - (alignVStart0 + alignVCenter0 + alignVEnd0 + alignVStart1 + alignVCenter1 + alignVEnd1) / 6;
  // 间距比
  let height = Math.max(c.y + c.height, d.y + d.height);
  let distance = Math.min(c.y, d.y) - Math.max(a.y + a.height, b.y + b.height);
  // 宽一致性
  let widthProportionH0 = Math.min(a.width, b.width) / Math.max(a.width, b.width);
  let widthProportionH1 = Math.min(c.width, d.width) / Math.max(c.width, d.width);
  let widthProportionH = Math.abs(widthProportionH0 - widthProportionH1);
  let widthTotal = a.width + b.width + c.width + d.width;
  let widthDiffH = Math.abs(a.width + b.width - c.width - d.width) / widthTotal;
  let widthProportionV0 = Math.min(a.width, c.width) / Math.max(a.width, c.width);
  let widthProportionV1 = Math.min(b.width, d.width) / Math.max(b.width, d.width);
  let widthProportionV = Math.abs(widthProportionV0 - widthProportionV1);
  let widthDiffV = Math.abs(a.width + c.width - b.width - d.width) / widthTotal;
  // 高一致性
  let heightProportionH0 = Math.min(a.height, b.height) / Math.max(a.height, b.height);
  let heightProportionH1 = Math.min(c.height, d.height) / Math.max(c.height, d.height);
  let heightProportionH = Math.abs(heightProportionH0 - heightProportionH1);
  let heightTotal = a.height + b.height + c.height + d.height;
  let heightDiffH = Math.abs(a.height + b.height - c.height - d.height) / heightTotal;
  let heightProportionV0 = Math.min(a.height, c.height) / Math.max(a.height, c.height);
  let heightProportionV1 = Math.min(b.height, d.height) / Math.max(b.height, d.height);
  let heightProportionV = Math.abs(heightProportionV0 - heightProportionV1);
  let heightDiffV = Math.abs(a.height + c.height - b.height - d.height) / heightTotal;
  // 字体一致性
  let fontProportionV0 = Math.min(a.fontSize, c.fontSize) / Math.max(a.fontSize, c.fontSize);
  let fontProportionV1 = Math.min(b.fontSize, d.fontSize) / Math.max(b.fontSize, d.fontSize);
  if(isNaN(fontProportionV0)) {
    fontProportionV0 = 0;
  }
  if(isNaN(fontProportionV1)) {
    fontProportionV1 = 0;
  }
  let fontProportionV = Math.abs(fontProportionV0 - fontProportionV1);
  let fontTotal = a.fontSize + b.fontSize + c.fontSize + d.fontSize;
  let fontDiffV = Math.abs(a.fontSize + c.fontSize - b.fontSize - d.fontSize) / fontTotal;
  if(isNaN(fontDiffV)) {
    fontDiffV = 0;
  }
  //行高一致性
  let lineHeightProportionV0 = Math.min(a.lineHeight, c.lineHeight) / Math.max(a.lineHeight, c.lineHeight);
  let lineHeightProportionV1 = Math.min(b.lineHeight, d.lineHeight) / Math.max(b.lineHeight, d.lineHeight);
  if(isNaN(lineHeightProportionV0)) {
    lineHeightProportionV0 = 0;
  }
  if(isNaN(lineHeightProportionV1)) {
    lineHeightProportionV1 = 0;
  }
  let lineHeightProportionV = Math.abs(lineHeightProportionV0 - lineHeightProportionV1);
  let lineHeightTotal = a.lineHeight + b.lineHeight + c.lineHeight + d.lineHeight;
  let lineHeightDiffV = Math.abs(a.lineHeight + c.lineHeight - b.lineHeight - d.lineHeight) / lineHeightTotal;
  if(isNaN(lineHeightDiffV)) {
    lineHeightDiffV = 0;
  }
  
  return [
    typeV,
    alignV,
    alignDiff,
    distance / height,
    widthProportionH,
    widthDiffH,
    widthProportionV,
    widthDiffV,
    heightProportionH,
    heightDiffH,
    heightProportionV,
    heightDiffV,
    fontProportionV,
    fontDiffV,
    lineHeightProportionV,
    lineHeightDiffV
  ];
}

const xr = [];
const yr = [];
const xc = [];
const yc = [];
const xr2 = [];
const yr2 = [];
const xc2 = [];
const yc2 = [];

dataes.forEach(item => {
  let { data, classify } = item;
  switch(classify) {
    case 0:
      xr.push(parseR(data));
      yr.push(0);
      xc.push(parseC(data));
      yc.push(0);
      xr2.push(parseR2(data));
      yr2.push(0);
      xc2.push(parseC2(data));
      yc2.push(0);
      break;
    case 1:
      xr.push(parseR(data));
      yr.push(1);
      xc.push(parseC(data));
      yc.push(0);
      xr2.push(parseR2(data));
      yr2.push(0);
      xc2.push(parseC2(data));
      yc2.push(0);
      break;
    case 2:
      xr.push(parseR(data));
      yr.push(0);
      xc.push(parseC(data));
      yc.push(1);
      xr2.push(parseR2(data));
      yr2.push(0);
      xc2.push(parseC2(data));
      yc2.push(0);
      break;
    case 3:
      xr.push(parseR(data));
      yr.push(1);
      xc.push(parseC(data));
      yc.push(1);
      xr2.push(parseR2(data));
      yr2.push(0);
      xc2.push(parseC2(data));
      yc2.push(0);
      break;
    case 4:
      xr.push(parseR(data));
      yr.push(1);
      xc.push(parseC(data));
      yc.push(1);
      xr2.push(parseR2(data));
      yr2.push(1);
      xc2.push(parseC2(data));
      yc2.push(0);
      break;
    case 5:
      xr.push(parseR(data));
      yr.push(1);
      xc.push(parseC(data));
      yc.push(1);
      xr2.push(parseR2(data));
      yr2.push(0);
      xc2.push(parseC2(data));
      yc2.push(1);
      break;
    case 6:
      xr.push(parseR(data));
      yr.push(1);
      xc.push(parseC(data));
      yc.push(1);
      xr2.push(parseR2(data));
      yr2.push(1);
      xc2.push(parseC2(data));
      yc2.push(1);
      break;
  }
});

const xrs = tf.tensor2d(xr);
const yrs = tf.tensor2d(yr, [yr.length, 1]);
const xcs = tf.tensor2d(xc);
const ycs = tf.tensor2d(yc, [yc.length, 1]);
const xr2s = tf.tensor2d(xr2);
const yr2s = tf.tensor2d(yr2, [yr2.length, 1]);
const xc2s = tf.tensor2d(xc2);
const yc2s = tf.tensor2d(yc2, [yc2.length, 1]);

const wr = tf.variable(tf.zeros([2, 1]));
const br = tf.variable(tf.scalar(0));
const wc = tf.variable(tf.zeros([2, 1]));
const bc = tf.variable(tf.scalar(0));
const wr2 = tf.variable(tf.zeros([16, 1]));
const br2 = tf.variable(tf.scalar(0));
const wc2 = tf.variable(tf.zeros([16, 1]));
const bc2 = tf.variable(tf.scalar(0));

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

for(let i = 0; i < 1000; i++) {
  optimizer.minimize(() => {
    const lossVar = loss(f(xrs, wr, br), yrs, yr.length);
    lossVar.print();
    return lossVar;
  });
  optimizer.minimize(() => {
    const lossVar = loss(f(xcs, wc, bc), ycs, yc.length);
    lossVar.print();
    return lossVar;
  });
  optimizer.minimize(() => {
    const lossVar = loss(f(xr2s, wr2, br2), yr2s, yr2.length);
    lossVar.print();
    return lossVar;
  });
  optimizer.minimize(() => {
    const lossVar = loss(f(xc2s, wc2, bc2), yc2s, yc2.length);
    lossVar.print();
    return lossVar;
  });
}

wr.print();
br.print();
wc.print();
bc.print();
wr2.print();
br2.print();
wc2.print();
bc2.print();

let countR = 0;
let listR = [];
let countC = 0;
let listC = [];
let countR2 = 0;
let listR2 = [];
let countC2 = 0;
let listC2 = [];
dataes.forEach(item => {
  let { id, data, classify } = item;
  let paramR = parseR(data);
  let paramR2 = parseR2(data);
  let paramC = parseC(data);
  let paramC2 = parseC2(data);
  let r = f([paramR], wr, br);
  let c = f([paramC], wc, bc);
  let r2 = f([paramR2], wr2, br2);
  let c2 = f([paramC2], wc2, bc2);
  let fr = r.get(0, 0) >= 0.5 ? 1 : 0;
  let fc = c.get(0, 0) >= 0.5 ? 1 : 0;
  let fr2 = r2.get(0, 0) >= 0.5 ? 1 : 0;
  let fc2 = c2.get(0, 0) >= 0.5 ? 1 : 0;
  if([1, 3, 4, 5, 6].indexOf(classify) > -1 && fr === 1 || [1, 3, 4, 5, 6].indexOf(classify) === -1 && fr === 0) {
    countR++;
  }
  else {
    listR.push([id, fr, classify]);
  }
  if([2, 3, 4, 5, 6].indexOf(classify) > -1 && fc === 1 || [2, 3, 4, 5, 6].indexOf(classify) === -1 && fc === 0) {
    countC++;
  }
  else {
    listC.push([id, fc, classify]);
  }
  if([4, 6].indexOf(classify) > -1 && fr2 === 1 || [4, 6].indexOf(classify) === -1 && fr2 === 0) {
    countR2++;
  }
  else {
    listR2.push([id, fr2, classify]);
  }
  if([5, 6].indexOf(classify) > -1 && fc2 === 1 || [5, 6].indexOf(classify) === -1 && fc2 === 0) {
    countC2++;
  }
  else {
    listC2.push([id, fc2, classify]);
  }
});
console.warn(`行正确率：${countR / dataes.length}，列正确率：${countC / dataes.length}，组行正确率：${countR2 / dataes.length}，组列正确率：${countC2 / dataes.length}`);
if(listR.length) {
  console.log('行');
  console.table(listR);
}
if(listC.length) {
  console.log('列');
  console.table(listC);
}
if(listR2.length) {
  console.log('组行');
  console.table(listR2);
}
if(listC2.length) {
  console.log('组列');
  console.table(listC2);
}
