const canvas = document.getElementById('my_canvas');
const ctx = canvas.getContext('2d');

const balls = [];


//velocity gets multiplied by (1-friction)
let friction = 0.01;
let current_ball_index = null;
let is_mouse_down = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
class Ball{
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r;
        this.vel_x = 0;
        this.vel_y = 0;
        this.acc_x = 0;
        this.acc_y = 0;
        this.acceleration = 1;
        this.speed = 0;
        this.player = false;
        this.index=balls.length;
        balls.push(this);
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    //displaying the current acceleration and the velocity of the ball
    display(){
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.acc_x*100, this.y + this.acc_y*100);
        ctx.strokeStyle = "green";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vel_x*10, this.y + this.vel_y*10);
        ctx.strokeStyle = "blue";
        ctx.stroke();
        ctx.closePath();
    }

    update(){


        //acceleration values added to the velocity components
        this.vel_x += this.acc_x;
        this.vel_y += this.acc_y;
        //velocity gets multiplied by a number between 0 and 1
        this.vel_x *= 1-friction;
        this.vel_y *= 1-friction;
        //velocity values added to the current x, y position
    


        //borders check
        if ((this.x + this.r) > canvas.clientWidth){
            this.vel_x = - this.vel_x;
            this.x=  canvas.clientWidth - this.r -1;
        }
        if ((this.y + this.r) > canvas.clientHeight){
            this.vel_y = - this.vel_y;
            this.y=  canvas.clientHeight - this.r -1;
        }
        if ((this.x - this.r) < 0){
            this.vel_x = - this.vel_x;
            this.x= this.r +1;
        }
        if ((this.y - this.r) < 0){
            this.vel_y = - this.vel_y;
            this.y= this.r + 1;
        }
        this.x += this.vel_x;
        this.y += this.vel_y;
        
        //friction
        if (this.vel_x > 0) {
            this.vel_x-=1;
            if (this.vel_x < 0) {
                this.vel_x = 0;
                this.acc_x = 0;
            }
        } else {
            this.vel_x+=1;
            if (this.vel_x > 0) {
                this.vel_x = 0;
                this.acc_x = 0;
            }
        }
        if (this.vel_y > 0) {
            this.vel_y-=1;
            if (this.vel_y < 0) {
                this.vel_y = 0;
                this.acc_y = 0;
            }
        } else {
            this.vel_y+=1;
            if (this.vel_y > 0) {
                this.vel_y = 0;
                this.acc_y = 0;
            }
        }
        this.x += this.vel_x;
        this.y += this.vel_y;
 
        this.drawBall();
        this.display();
    }
}

let getDistance = (xpos1,ypos1,xpos2,ypos2) => {
    var result = Math.sqrt(Math.pow(xpos2 - xpos1, 2) + Math.pow(ypos2 - ypos1, 2))
    return result;
}

let is_mouse_in_ball = (x,y,ball) =>{
    if (getDistance(ball.x, ball.y, x,y) < ball.r) {
        return true;
    } else {
        return false;
    }
}

let mouse_down = (e) => {
    e.preventDefault();
    is_mouse_down = true;
    var mousePos = getMousePos(canvas, e);
    let mouseX = mousePos.x;
    let mouseY = mousePos.y;
    let index = 0;

    for (let ball of balls){
        if (is_mouse_in_ball(mouseX, mouseY, ball)) {
            current_ball_index = ball.index
            console.log("In Ball", current_ball_index)
            return;
        }  else {
            mouse_down = true;
        }
        index++;
    }
}

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

let mouse_move = (e) => {
    console.log('1')
    if (!is_mouse_down){
        return;
    } else {
        e.preventDefault();
        var mousePos = getMousePos(canvas, e);
        let mouseX = mousePos.x;
        let mouseY = mousePos.y;
        for (let b of balls){
            if (is_mouse_in_ball(mouseX, mouseY, b)){
                if (b.x < mouseX){
                    b.acc_x = -b.acceleration;
                } else {
                    b.acc_x = b.acceleration;
                }

                if (b.y < mouseY){
                    b.acc_y = -b.acceleration;
                } else {
                    b.acc_y = b.acceleration;
                }
                //acceleration values added to the velocity components
                b.vel_x += b.acc_x;
                b.vel_y += b.acc_y;
                //velocity gets multiplied by a number between 0 and 1
                b.vel_x *= 1-friction;
                b.vel_y *= 1-friction;
                //velocity values added to the current x, y position
                b.x += b.vel_x;
                b.y += b.vel_y;
            }
        }
        


    }
}


let mouse_up = (e) => {
    is_mouse_down = false;
}

function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    balls.forEach((b) => {
        b.update();
    });
    requestAnimationFrame(mainLoop);
}

let Ball1 = new Ball(200, 200, 60);
Ball1.player = true;
// let Ball2 = new Ball(100, 100, 40);
 let Ball3 = new Ball(400, 150, 50);
// let Ball4 = new Ball(200, 100, 60);
canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmousemove = mouse_move;

requestAnimationFrame(mainLoop);
