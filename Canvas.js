const canvas = document.getElementById('my_canvas');
const ctx = canvas.getContext('2d');

var w_height = window.innerHeight/2;
var w_width = window.innerWidth/2;

canvas.width = w_width;
canvas.height = w_height;

const balls = [];
const walls = [];

let friction = 0.05;
let is_mouse_down = false;



class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
    
    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }
}

class Ball{
    constructor(x, y, r, m){
        this.pos = new Vector(x,y);
        this.r = r;
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.elasticity = 1;
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = 1;
        this.player = false;
        this.index=balls.length;
        balls.push(this);
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

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.pos = this.pos.add(this.vel);
    }
}

//Walls are line segments between two points
class Wall{
    constructor(x1, y1, x2, y2){
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        walls.push(this);
    }

    drawWall(){
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    wallUnit(){
        return this.end.subtr(this.start).unit();
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
            } else {
                b.acc.x = 0;
                b.acc.y = 0;
            }
        }        
    }
}


let mouse_up = (e) => {
    is_mouse_down = false;
}


function randInt(min, max){
    return Math.floor(Math.random() * (max-min+1)) + min;
}

//returns with the closest point on a line segment to a given point
function closestPointBW(b1, w1){
    let ballToWallStart = w1.start.subtr(b1.pos);
    if(Vector.dot(w1.wallUnit(), ballToWallStart) > 0){
        return w1.start;
    }

    let wallEndToBall = b1.pos.subtr(w1.end);
    if(Vector.dot(w1.wallUnit(), wallEndToBall) > 0){
        return w1.end;
    }

    let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
    let closestVect = w1.wallUnit().mult(closestDist);
    return w1.start.subtr(closestVect);
}

function coll_det_bb(b1, b2){
    if(b1.r + b2.r >= b2.pos.subtr(b1.pos).mag()){
        return true;
    } else {
        return false;
    }
}

//collision detection between ball and wall
function coll_det_bw(b1, w1){
    let ballToClosest = closestPointBW(b1, w1).subtr(b1.pos);
    if (ballToClosest.mag() <= b1.r){
        return true;
    }
}

function pen_res_bb(b1, b2){
    let dist = b1.pos.subtr(b2.pos);
    let pen_depth = b1.r + b2.r - dist.mag();
    let pen_res = dist.unit().mult(pen_depth / (b1.inv_m + b2.inv_m));
    b1.pos = b1.pos.add(pen_res.mult(b1.inv_m));
    b2.pos = b2.pos.add(pen_res.mult(-b2.inv_m));
}

//penetration resolution between ball and wall
function pen_res_bw(b1, w1){
    let penVect = b1.pos.subtr(closestPointBW(b1, w1));
    b1.pos = b1.pos.add(penVect.unit().mult(b1.r-penVect.mag()));
}

function coll_res_bb(b1, b2){
    let normal = b1.pos.subtr(b2.pos).unit();
    let relVel = b1.vel.subtr(b2.vel);
    let sepVel = Vector.dot(relVel, normal);
    let new_sepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);
    
    let vsep_diff = new_sepVel - sepVel;
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.mult(impulse);

    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
    b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m));
}

//collision response between ball and wall
function coll_res_bw(b1, w1){
    let normal = b1.pos.subtr(closestPointBW(b1, w1)).unit();
    let sepVel = Vector.dot(b1.vel, normal);
    let new_sepVel = -sepVel * b1.elasticity;
    let vsep_diff = sepVel - new_sepVel;
    b1.vel = b1.vel.add(normal.mult(-vsep_diff));
}

function mainLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    balls.forEach((b, index) => {
        b.drawBall();
        //each ball object iterates through each wall object
        walls.forEach((w) => {
            if(coll_det_bw(balls[index], w)){
                pen_res_bw(balls[index], w);
                coll_res_bw(balls[index], w);
            }
        })
        for(let i = index+1; i<balls.length; i++){
            if(coll_det_bb(balls[index], balls[i])){
                pen_res_bb(balls[index], balls[i]);
                coll_res_bb(balls[index], balls[i]);
            }
        }
        b.reposition();
    });

    //drawing each wall on the canvas
    walls.forEach((w) => {
        w.drawWall();
    })

    requestAnimationFrame(mainLoop);
}

for (let i = 0; i < 10; i++){
    let newBall = new Ball(randInt(100,500), randInt(50,400), randInt(20,40), randInt(0,10));
    newBall.elasticity = randInt(0,10) / 10;
}

//walls along the canvas edges
let edge1 = new Wall(0, 0, canvas.clientWidth, 0);
let edge2 = new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight);
let edge3 = new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight);
let edge4 = new Wall(0, canvas.clientHeight, 0, 0);

canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmousemove = mouse_move;

requestAnimationFrame(mainLoop);
