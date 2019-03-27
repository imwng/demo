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
var arr = [[1, 1, 1, 1], [2, 2, 2, 2], [3, 3, 3, 3], [4, 4, 4, 4]];

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
```
![二维数组转置](https://github.com/imwng/demo/blob/master/imgs/2048_转置.png)
