const ROSLIB = require('roslib')
const WebSocket = require('ws')
var List = require("collections/list");

const wss = new WebSocket.Server({port: 8082 })

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

function AngleToRadian(angle) {
  return angle * Math.PI / 180
}

function EuclideanDistance(currentX, currentY, targetX, targetY) {
  return Math.sqrt(Math.pow((targetX-currentX),2) + Math.pow((targetY-currentY),2))
}

function RoundDecimal(number, index) {
  return Math.round(number*Math.pow(10,index))/Math.pow(10,index)
}

function GetNumberAfterComma(number) {
  number = Math.abs(number)
  return number - Math.floor(number)
}

wss.on('connection', ws => {
  console.log('Mobile client connected')

  const ros = new ROSLIB.Ros({  url : "ws://192.168.56.101:9090" })

  ros.on("connection", () => {
    console.log('Rosbridge created successful')
    ws.send(JSON.stringify(
        {
          event: "Connection",  
          message: "Successful",
        }
      )
    )
  });
  
  ros.on("error", (error) => {
    console.log(error)
    ws.send(JSON.stringify(
      {
        event: "Connection",  
        message: "Error",
      }
    )
  )
  });
  
  ros.on("close", () => {
    console.log('Rosbridge closed')
    ws.send(JSON.stringify(
      {
        event: "Connection",  
        message: "Close",
      }
    )
  )
  });

  //For turtlebot
  var turtlebot_odom_topic = new ROSLIB.Topic({
    ros: ros,
    name: "/odom",
    messageType: "nav_msgs/Odometry"
  })

  var turtlebot_cmd_vel_topic = new ROSLIB.Topic({
    ros: ros,
    name: "/cmd_vel",
    messageType: "geometry_msgs/Twist"
  })

  var x_turtlebot = 0
  var real_x_turtlebot = 0
  var y_turtlebot = 0
  var real_y_turtlebot = 0
  var yaw_turtlebot = 0

  var x_round = 0
  var y_round = 0

  // turtlebot_odom_topic.subscribe((data)=> {
  //   var qx = data.pose.pose.orientation.x
  //   var qy = data.pose.pose.orientation.y
  //   var qz = data.pose.pose.orientation.z
  //   var qw = data.pose.pose.orientation.w
  //   if (real_x_turtlebot != RoundDecimal(data.pose.pose.position.x,2) 
  //       || real_y_turtlebot != RoundDecimal(data.pose.pose.position.y,2)
  //       || yaw_turtlebot != RoundDecimal(QuaternionToEuler(qx,qy,qz,qw)[2],2)) {
  //     yaw_turtlebot = RoundDecimal(QuaternionToEuler(qx,qy,qz,qw)[2],2)
  //     if (data.pose.pose.position.x >= 0) {
  //       if(GetNumberAfterComma(data.pose.pose.position.x)>0.8) {
  //         x_turtlebot = Math.round(data.pose.pose.position.x)
  //       } else {
  //         x_turtlebot = Math.floor(data.pose.pose.position.x)
  //       }
  //     } else {
  //       if(GetNumberAfterComma(data.pose.pose.position.x) <0.2) {
  //         x_turtlebot = Math.round(data.pose.pose.position.x)
  //       } else {
  //         x_turtlebot = Math.floor(data.pose.pose.position.x)
  //       }
  //     }

  //     if (data.pose.pose.position.y >= 0) {
  //       if(GetNumberAfterComma(data.pose.pose.position.y)>0.85) {
  //         y_turtlebot = Math.round(data.pose.pose.position.y)
  //       } else {
  //         y_turtlebot = Math.floor(data.pose.pose.position.y)
  //       }
  //     } else {
  //       if(GetNumberAfterComma(data.pose.pose.position.y) <0.15) {
  //         y_turtlebot = Math.round(data.pose.pose.position.y)
  //       } else {
  //         y_turtlebot = Math.floor(data.pose.pose.position.y)
  //       }
  //     }
    
  //     real_x_turtlebot = RoundDecimal(data.pose.pose.position.x,2)
  //     real_y_turtlebot = RoundDecimal(data.pose.pose.position.y,2)
  //     console.log("x,y real current:",real_x_turtlebot,real_y_turtlebot)
  //     console.log("x,y :",x_turtlebot,y_turtlebot)
  //     ws.send(JSON.stringify(
  //       {
  //       event: "Position",
  //       coordinateX: x_turtlebot,
  //       coordinateY: y_turtlebot,
  //       yaw: yaw_turtlebot,
  //       realCoordinateX: real_x_turtlebot,
  //       realCoordinateY: real_y_turtlebot
  //       }
  //     ))
  //   }
  // })

  turtlebot_odom_topic.subscribe((data)=> {
    var qx = data.pose.pose.orientation.x
    var qy = data.pose.pose.orientation.y
    var qz = data.pose.pose.orientation.z
    var qw = data.pose.pose.orientation.w
    
    if (data.pose.pose.position.x >= 0) {
      if(GetNumberAfterComma(data.pose.pose.position.x)>0.95) {
        x_turtlebot = Math.round(data.pose.pose.position.x)
      } else {
        x_turtlebot = Math.floor(data.pose.pose.position.x)
      }
    } else {
      if(GetNumberAfterComma(data.pose.pose.position.x) <0.05) {
        x_turtlebot = Math.round(data.pose.pose.position.x)
      } else {
        x_turtlebot = Math.floor(data.pose.pose.position.x)
      }
    }

    if (data.pose.pose.position.y >= 0) {
      if(GetNumberAfterComma(data.pose.pose.position.y)>=0.95) {
        y_turtlebot = Math.round(data.pose.pose.position.y)
      } else {
        y_turtlebot = Math.floor(data.pose.pose.position.y)
      }
    } else {
      if(GetNumberAfterComma(data.pose.pose.position.y) <0.05) {
        y_turtlebot = Math.round(data.pose.pose.position.y)
      }else {
        y_turtlebot = Math.floor(data.pose.pose.position.y)
      }
    }
  
    yaw_turtlebot = QuaternionToEuler(qx,qy,qz,qw)[2]
    real_x_turtlebot = data.pose.pose.position.x
    real_y_turtlebot = data.pose.pose.position.y
    x_round = RoundDecimal(data.pose.pose.position.x,1)
    y_round = RoundDecimal(data.pose.pose.position.y,1)
    ws.send(JSON.stringify(
      {
      event: "Position",
      coordinateX: x_turtlebot,
      coordinateY: y_turtlebot,
      yaw: yaw_turtlebot,
      realCoordinateX: real_x_turtlebot,
      realCoordinateY: real_y_turtlebot,
      roundX: x_round,
      roundY: y_round
      }
    ))
  })


  ws.on('message', message => {
      try {
          const data = JSON.parse(message)
          var kP = 0.3 
          if (data.event == "Goal") {
            var move_forward = false
            var inc_x = data.targetX-data.currentX
            var inc_y = data.targetY-data.currentY
            var theta = data.currentYaw
            var angle_to_goal = Math.atan2(inc_y,inc_x)
            var dist = Math.sqrt(Math.pow(inc_x,2)+ Math.pow(inc_y,2))
            
            var turn = Math.atan2(Math.sin(angle_to_goal-theta), Math.cos(angle_to_goal-theta))

            console.log(angle_to_goal*180/Math.PI)
            //console.log(Math.abs(angle_to_goal-theta))
            // if(angle_to_goal = 180 && theta<0) {
            //   angle_to_goal = -180
            // }
            var twist = new ROSLIB.Message({
              linear: {
                x: 0,
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: 0.5*(angle_to_goal-theta)
              }
            })
            if(Math.abs(angle_to_goal-theta) < 0.1) {
              move_forward = true
            }
            if (move_forward == true) {
              if (0.1 * dist  > 0.3 && 0.1 * dist < 0.7) {
                twist = new ROSLIB.Message({
                  linear: {
                    x: 0.1*dist,
                    y: 0,
                    z: 0
                  },
                  angular: {
                    x: 0,
                    y: 0,
                    z: 0
                  }
                })
              } else if (0.1 * dist > 0.7) {
                twist = new ROSLIB.Message({
                  linear: {
                    x: 0.7,
                    y: 0,
                    z: 0
                  },
                  angular: {
                    x: 0,
                    y: 0,
                    z: 0
                  }
                })
              } else {
                twist = new ROSLIB.Message({
                  linear: {
                    x: 0.2,
                    y: 0,
                    z: 0
                  },
                  angular: {
                    x: 0,
                    y: 0,
                    z: 0
                  }
                })
              }
            }
            turtlebot_cmd_vel_topic.publish(twist)
            }
          if (data.event == "Rotate") {
            var current_yaw = data.currentYaw
            var yaw_target = AngleToRadian(data.targetYaw)
            var twist = new ROSLIB.Message({
              linear: {
                x: 0,
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: kP*(yaw_target - current_yaw)
              }
            })
            turtlebot_cmd_vel_topic.publish(twist)
          }
          if (data.event == "Straight X") {
            var current_x = data.currentX
            var current_y = data.currentY
            var target_x = data.targetX
            var target_y = data.targetY

            var twist = new ROSLIB.Message({
              linear: {
                x: kP*(target_x-current_x),
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: 0
              }
            })
            turtlebot_cmd_vel_topic.publish(twist)
          }
          if (data.event == "Straight Y") {
            var current_x = data.currentX
            var current_y = data.currentY
            var target_x = data.targetX
            var target_y = data.targetY

            var twist = new ROSLIB.Message({
              linear: {
                x: kP*(target_y-current_y),
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: 0
              }
            })
            turtlebot_cmd_vel_topic.publish(twist)
          }
          if (data.event == "Bias") {
            var current_x = data.currentX
            var current_y = data.currentY
            var target_x = data.targetX
            var target_y = data.targetY

            var twist = new ROSLIB.Message({
              linear: {
                x: 0.05*EuclideanDistance(current_x,current_y,target_x,target_y),
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: 0
              }
            })
            turtlebot_cmd_vel_topic.publish(twist)
          }
          if (data.event == "Forward" || data.event == "Backward" || data.event == "Stop") {
            var twist = new ROSLIB.Message({
              linear: {
                x:kP*data.linear,
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: 0
              }
            })
            turtlebot_cmd_vel_topic.publish(twist)
          }
          if(data.event == "Up left" 
          || data.event == "Up right" 
          || data.event == "Left" 
          || data.event == "Right"
          || data.event == "Down Left" 
          || data.event == "Down Right") {
            var yaw_target = AngleToRadian(data.angular)
            var twist = new ROSLIB.Message({
              linear: {
                x: 0,
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: kP*yaw_target
              }
            })
            turtlebot_cmd_vel_topic.publish(twist)
            setTimeout(() => {
              var twist = new ROSLIB.Message({
                linear: {
                  x: kP*data.linear,
                  y: 0,
                  z: 0
                },
                angular: {
                  x: 0,
                  y: 0,
                  z: 0
                }
              })
              turtlebot_cmd_vel_topic.publish(twist)
            }, 3500)
            console.log(yaw_turtlebot*180/Math.PI)
          }
          if(data.event == "Rotate Left" 
          || data.event == "Rotate Right" ) {
            var yaw_target = AngleToRadian(data.angular)
            var twist = new ROSLIB.Message({
              linear: {
                x: 0,
                y: 0,
                z: 0
              },
              angular: {
                x: 0,
                y: 0,
                z: 0.1*yaw_target
              }
            })
            console.log(yaw_turtlebot)
            turtlebot_cmd_vel_topic.publish(twist)
          }  
      } catch (e) {
          console.log(`${e.message}`)
      }
  })

  ws.on('close', () => {
      console.log('Mobile client has disconnected')
  })
  
})

  