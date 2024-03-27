const canvas = document.getElementById('my_canvas');
const ctx = canvas.getContext('2d');

const balls = [];


//velocity gets multiplied by (1-friction)
let friction = 0.01;
let current_ball_index = null;
let is_mouse_down = false;
canvas.width = '500';
canvas.height = '500';

class Vector {
    constructor(x,y){
        this.x=x;
        this.y=y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y)
    }

    substract(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    magnitude(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    unit(){
        if (this.magnitude()===0) {
            return new Vector(0,0);
        } else {            
            return new Vector(this.x/this.magnitude(), this.y/this.magnitude());
        }
    }

    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    static dot(v1,v2){
        return v1.x*v2.x + v1.y*v2.y;
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x*n, start_y + this.y*n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath()
    }
}

class Ball{
    constructor(x, y, r){
        this.pos = new Vector(x,y)
        this.r = r;
        this.velocity = new Vector(0,0)
        this.acc = new Vector(0,0)
        this.acceleration = 1;
        this.speed = 0;
        this.player = false;
        this.index=balls.length;
        balls.push(this);
        console.log(this.index)
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    //displaying the current acceleration and the velocity of the ball
    display(){
        this.velocity.drawVec(this.pos.x, this.pos.y, 10, 'green')
        this.acc.unit().drawVec(this.pos.x, this.pos.y, 10, 'blue')
        this.acc.normal().drawVec(this.pos.x, this.pos.y, 10, 'black')
    }

    update(){

        this.acc = this.acc.unit();
        //acceleration values added to the velocity components
        this.velocity = this.velocity.add(this.acc);
        //velocity gets multiplied by a number between 0 and 1
        this.velocity = this.velocity.mult(1-friction)
        //velocity values added to the current x, y position
    
        this.pos = this.pos.add(this.velocity)


        //borders check
        
        if ((this.pos.x + this.r) > canvas.clientWidth){
            this.velocity.x = - this.velocity.x;
            this.pos.x=  canvas.clientWidth - this.r -1;
        }
        if ((this.pos.y + this.r) > canvas.clientHeight){
            this.velocity.y = - this.velocity.y;
            this.pos.y=  canvas.clientHeight - this.r -1;
        }
        if ((this.pos.x - this.r) < 0){
            this.velocity.x = - this.velocity.x;
            this.pos.x= this.r +1;
        }
        if ((this.pos.y - this.r) < 0){
            this.velocity.y = - this.velocity.y;
            this.pos.y= this.r + 1;
        }
        
        //friction
        if (this.velocity.x > 0) {
            this.velocity.x-=1;
            if (this.velocity.x < 0) {
                this.velocity.x = 0;
                this.acc_x = 0;
            }
        } else {
            this.velocity.x+=1;
            if (this.velocity.x > 0) {
                this.velocity.x = 0;
                this.acc_x = 0;
            }
        }
        if (this.velocity.y > 0) {
            this.velocity.y-=1;
            if (this.velocity.y < 0) {
                this.velocity.y = 0;
                this.acc_y = 0;
            }
        } else {
            this.velocity.y+=1;
            if (this.velocity.y > 0) {
                this.velocity.y = 0;
                this.acc_y = 0;
            }
        }
 
        this.drawBall();
        this.display();
    }
}

let getDistance = (xpos1,ypos1,xpos2,ypos2) => {
    var result = Math.sqrt(Math.pow(xpos2 - xpos1, 2) + Math.pow(ypos2 - ypos1, 2))
    return result;
}

let is_mouse_in_ball = (x,y,ball) =>{
    if (getDistance(ball.pos.x, ball.pos.y, x,y) < ball.r) {
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
    if (!is_mouse_down){
        return;
    } else {
        e.preventDefault();
        var mousePos = getMousePos(canvas, e);
        let mouseX = mousePos.x;
        let mouseY = mousePos.y;
        for (let b of balls){
            if (is_mouse_in_ball(mouseX, mouseY, b)){
                if (b.pos.x < mouseX){
                    b.acc.x = -b.acceleration;
                } else {
                    b.acc.x = b.acceleration;
                }

                if (b.pos.y < mouseY){
                    b.acc.y = -b.acceleration;
                } else {
                    b.acc.y = b.acceleration;
                }
                
            }
        }
        


    }
}


let mouse_up = (e) => {
    is_mouse_down = false;
}

function coll_det(b1,b2){
    if(b1.r + b2.r >= b2.pos.substract(b1.pos).magnitude()){
        return true;
    } else {
        return false;
    }
}

function pen_res(b1,b2){
    let dist = b1.pos.substract(b2.pos);
    let pen_depth = b1.r + b2.r - dist.magnitude();
    let pen_res = dist.unit().mult(pen_depth/2);
    b1.pos = b1.pos.add(pen_res);
    b2.pos = b2.pos.add(pen_res.mult(-1));
}

function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    balls.forEach((b, i) => {
        b.update();

        for (let j = i+1; j < balls.length; j++){
            if (coll_det(balls[i], balls[j])){
                pen_res(balls[i],balls[j])
            }
        }
    });

  
    requestAnimationFrame(mainLoop);
}

let Ball1 = new Ball(200, 200, 60);
Ball1.player = true;
let Ball2 = new Ball(100, 100, 40);
let Ball3 = new Ball(400, 150, 50);
let Ball4 = new Ball(200, 100, 60);
canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmousemove = mouse_move;

requestAnimationFrame(mainLoop);
