/**
 * 二维数组的转置函数
 * @return 无返回，作用于原数组
 */ 
Array.prototype.transpose = function () {
  if (this.length <= 0 || !this[0].length) return this;
  let temp = this[0].map((col, i) => {
    return this.map(row => {
      return row[i];
    });
  });
  temp.forEach((item, index) => {
    this[index] = item;
  });
  this.length = temp.length;
}

/**
 * 清空数组里的0元素
 * @return 无返回，作用于原数组
 */
Array.prototype.clearZero = function () {
  let temp = this.filter(item => {
    return item != 0;
  });
  temp.forEach((item, index) => {
    this[index] = item;
  });
  this.length = temp.length;
}

/**
 * 一维数组补0
 * @return 无返回，作用于原数组
 */
Array.prototype.paddingZero = function (length, reverse = false) {
  if (length < this.length) return;
  let minus = length - this.length;
  let padding = ('0').repeat(minus).split('');
  let temp = reverse ? padding.concat(this) : this.concat(padding);
  temp.forEach((item, index) => {
    this[index] = item;
  });
  this.length = temp.length;
}

/**
 * 一维数组相邻位相同值计算
 * @return 无返回，作用于原数组
 */
Array.prototype.calc = function () {
  let temp = reverse ? this.reverse() : this;
  for (let i = 0; i < temp.length - 1; ) {
    if (temp[i] === temp[i+1]) {
      // 相邻位相同值运算
      temp[i] *= 2;
      temp[i+1] = 0;
      i += 2;
    } else {
      i++;
    }
  }
  temp = reverse ? temp.reverse() : temp;
  temp.forEach((item, index) => {
    this[index] = item;
  });
  this.length = temp.length;
}
