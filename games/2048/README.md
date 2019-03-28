## 2048

> 玩法介绍：
> * 通过方向键控制所有方块下落方向
> * 下落过程中，相同方块数值消掉后生成一个(*2)值的新方块

![整体过程](https://github.com/imwng/demo/blob/master/imgs/2048.png)

### 开发流程：
1. 设计开发处理器[渲染器]，功能是将二维数组渲染到canvas
2. 二维数据状态的变更

#### 二维数组的转置
> 在垂直方向上，将数组转置后更方便计算上升下落过程中方块与方块、方块与边界的碰撞。
```
二维数组的转置：行列交换，第n行和第n列的数据交换
var arr = [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]];

// map 正常存入顺序：行
// 外层arr[0].map作用：获取列标
// 内层arr.map作用：按列取值
var newArr = arr[0].map((col, i) => {
  return arr.map(row => {
    return row[i];
  });
});


等价于 => :
// 按列取值
var newArr = [[], [], [], []];
for (var i = 0; i < arr[0].length; i++) {
  // 先第一列
  for (var j = 0; j < arr.length; j++) {
    newArr[j][i] = arr[i][j];
  }
}


// 扔到数组的原型链上
Array.prototype.transpose = function () {
  if (this.length <= 0 || !this[0].length) return this;
  return this[0].map((col, i) => {
    return this.map(row => {
      return row[i];
    });
  });
}

// 修改为作用于原数组
Array.prototype.tranpose = function () {
  if (this.length <= 0 || !this[0].length) return this;
  let temp = this[0].map((col, i) => {
    return this.map(row => {
      return row[i];
    });
  });
  for (let i = 0; i < temp.length; i++) {
    this[i] = temp[i];
  }
  this.length = temp.length;
}
```
![二维数组转置](https://github.com/imwng/demo/blob/master/imgs/2048_转置.png)


#### 边界碰撞 [二维数组的状态变更]
> 二维数组在行|列方向上做0判断：
> * 向左向右 => 行判断，同一行是否存在多个0，存在，删除全部0的位置，逆方向上补0
> * 向上向下 => 列判断，同一列是否存在多个0，存在，删除全部0的位置，逆方向上补0

> 举个例子：

> 向左操作，第一行原：[1, 0, 3, 0];

> 结果：[1, 3, 0, 0];

> 具体步骤：
> 1. 删除全部0，[1, 3]
> 2. 逆方向：向左的逆方向是右边
> 3. 右边补齐0，[1, 3, 0, 0]

```
数组清空0元素：
Array.prototype.clearZero = function () {
  let temp = this.filter(item => {
    return item != 0;
  });
  // this 不能显式赋值
  for (let i = 0; i < temp.length; i++) {
    this[i] = temp[i];
  }
  this.length = temp.length;
}

// 对原数组做修改：
// 1. this数组元素修改
// 2. 控制数组长度
```

```
数组补0：
// 第一种方式：
Array.prototype.paddingZero = function (length, reverse = false) {
  if (length < this.length) return this;
  let minus = length - this.length;
  let padding = ('0').repeat(minus).split('');
  let temp = reverse ? padding.concat(this) : this.concat(padding);
  for (let i = 0; i < temp.length; i++) {
    this[i] = temp[i];
  }
  this.length = temp.length;
}

// 用字符串的repeat方法，感觉上写法更直观，用while循环填充0，还要判断reverse，感觉代码重复过多，如下：
// 第二种方式：
Array.prototype.paddingZero = function (length, reverse = false) {
  if (length < this.length) return this;
  if (reverse) {
    while (this.length < length) {
      this.push(0);
    }
  } else {
    while (this.length < length) {
      this.unshift(0);
    }
  }
  // 直接作用于原数组
}

第一种方式的缺点是，0是字符串类型的，问题不大，做判断的时候用 != 或者加一步映射：
temp = temp.map(item => {
 	return parseInt(item);
});
// 稍微浪费点运算性能，但是对于这个游戏而言，本来计算量就不大，也没啥关系。
```

```
数组相邻位相同值计算：
Array.prototype.calc = function (reverse = false) {
  // 默认指针从左边开始
  temp = reverse ? this.reverse() : this;
  for (let i = 0; i < temp.length-1; ) {
    if (temp[i] === temp[i+1]) {
      // 相邻位相同
      temp[i] *= 2;
      temp[i+1] = 0;
      i += 2;
    } else {
      i++;
    }
  }
  temp = reverse ? temp.reverse() : temp;
  for (let i = 0; i < temp.length; i++) {
    this[i] = temp[i];
  }
  this.length = temp.length;
}

// 先reverse数组，总比两个for循环要好吧，两个for循环，一个正向，一个逆向遍历，想想都烦。

// 正向、逆向的区别:
var arr = [0, 2, 0, 2, 2, 0];
arr.calc();     // [0, 2, 0, 4, 0, 0];
arr.calc(true); // [0, 2, 0, 0, 4, 0];
```
![相邻位运算](https://github.com/imwng/demo/blob/master/imgs/2048_calc运算.png)

##### left碰撞
> 流程:
> 1. 向左坠落，清空位置0 [clearZero]
> 2. 计算碰撞 [calc]
> 3. 计算后，如果有消除一格，就会多出一格位置0，所以要再次清空0 [clearZero]
> 4. 补齐右边的位置0

```
left操作属于map类的操作：
class Map {
  ...
  left () {
    // this 指向二维数组
    for (let i = 0; i < this.length; i++) {
      this[i].clearZero();
      this[i].calc();
      this[i].clearZero();
      this[i].paddingZero(4);
    }
  }
}
```
> 其他方向的碰撞类似，需要注意方向，以及垂直方向上做二维数组的转置，然后可以抽出一部分公共方法，比如起名drop

```
class Map {
  ...
  drop (direction = 'left') {
    let reverse;
    switch (direction) {
      case 'left':
        reverse = false;
        needTranspose = false;
        break;
      case 'right':
        reverse = true;
        needTranspose = false;
        break;
      case 'up':
        reverse = false;
        needTranspose = true;
        break;
      case 'down':
        reverse = true;
        needTranspose = true;
        break;
    }
    // 二维数组转置
    if (needTranspose) this.needTranspose();
    
    for (let i = 0; i < this.length; i++) {
      this[i].clearZero(reverse);
      this[i].calc(reverse);
      this[i].clearZero(reverse);
      this[i].paddingZero(4, reverse);
    }
    // 转置回来
    if (needTranspose) this.needTranspose();
  }
  left () {
    this.drop('left');
  }
}

// 转置的作用：
// 将down操作 → right操作
// 将up操作 → left操作
```

##### 转置和逆序的作用
![](https://github.com/imwng/demo/blob/master/imgs/2048_drop.png)

##### 生成随机位置
> 每一次碰撞后，会增加一个2。

```
class Map {
  ...
  next () {
    // 1. 展平 二维 -> 一维
    let temp = this.flat();
    let posArr = [];
    temp.forEach((item, index) => {
      if (item === 0) {
        posArr.push(index);
      }
    });
    
    // 一维数组的index和二维数组的i,j之间存在联系
    // i = parseInt(index / 4);
    // j = index % 4;
    // 4 是二维数组的长宽
    
    // 2. 随机选择一个位置为0的空格
    let rand = Math.floor(Math.random() * posArr.length);
    let pos = posArr[rand];
    let i = parseInt(pos / 4);
    let j = pos % 4;
    this[i][j] = 2;
  }
}

// 判断数组里是否还有0元素
Array.prototype.hasZero = function () {
  // 展平
  let temp = this.join(',').split(',').map(item => {
    return ~~item;
  });
  return temp.indexOf(0) !== -1;
}
```
