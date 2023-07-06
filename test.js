var List = require("collections/list");
var my_float = 0.0027

function QuaternionToEuler(x, y, z, w) {
    var t0 = 2.0 * (w * x + y * z)
    var t1 = 1.0 - 2.0 * (x * x + y * y)
    var roll = Math.atan2(t0, t1)
    var t2 = 2.0 * (w * y - z * x)
    if (t2> 1.0) {
        t2 = 1.0
    }
    if (t2 < -1) {
        t2 = -1
    }
    var pitch = Math.asin(t2)
    var t3 = 2.0 * (w * z + x * y)
    var t4 = 1.0 - 2.0 * (y * y + z * z)
    var yaw = Math.atan2(t3, t4)
    var eulerList = new List([]);
    eulerList.push(roll)
    eulerList.push(pitch)
    eulerList.push(yaw)
    return eulerList.toArray()
  }
var a = QuaternionToEuler(0,0,1.59,1.59)[2]
function RoundDecimal(number, index) {
    return Math.round(number*Math.pow(10,index))/Math.pow(10,index)
}
b = RoundDecimal(a,1)
c = RoundDecimal(a,2)
d = RoundDecimal(a,3)

//console.log(Math.atan2(-1,1)*180/Math.PI)
console.log(RoundDecimal(0.994,2))

var a =0
//Tạo hàm higher-order function
// function orange(func){
//     func(11);
//   }
  
//   //Chạy hàm higher-order function và ghi trực tiếp hàm callback trong đối số
//   orange(dmm)

//   function dmm(data) {
//     var i =0;
//     while(i<5) {
//         sleep(1000)
//         a++
//         i++
//     }
//   }
//   function sleep(milliseconds) {
//     const date = Date.now();
//     let currentDate = null;
//     do {
//       currentDate = Date.now();
//     } while (currentDate - date < milliseconds);
//   }

// const sleep = (milliseconds) => {
//   return new Promise(resolve => setTimeout(resolve, milliseconds))
// }
// const list = [1, 2, 3, 4]
// const doSomething = async () => {
//     for (const item of list) {
//       await sleep(1000)
//       console.log(item)    
//     }
// }

// doSomething()

// console.log('start');
// function loop(index, limit, count){
//    console.log(index);
//    if (index < count){
//        index ++;
//        setTimeout(()=>{
//            loop(index, limit, count);
//        }, limit)
//    } else {
//        printEnd();
//    }
// }

// loop(0, 1000, 3);

// function printEnd(){
//    console.log('end');
// }
