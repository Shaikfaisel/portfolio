// ===============================================
// PCB PARTICLE ENGINE
// ===============================================

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let particles = [];

const TOTAL = 85;

function resizeCanvas(){

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

class Node{

    constructor(){

        this.reset();

    }

    reset(){

        this.x = Math.random()*canvas.width;

        this.y = Math.random()*canvas.height;

        this.radius = Math.random()*2+1;

        this.speed = .15+Math.random()*.25;

        this.direction = Math.random()*Math.PI*2;

    }

    update(){

        this.x += Math.cos(this.direction)*this.speed;

        this.y += Math.sin(this.direction)*this.speed;

        if(this.x<0 || this.x>canvas.width ||
           this.y<0 || this.y>canvas.height){

            this.reset();

        }

    }

    draw(){

        ctx.beginPath();

        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);

        ctx.fillStyle="#8B6BFF";

        ctx.fill();

    }

}

for(let i=0;i<TOTAL;i++){

    particles.push(new Node());

}

function connect(){

    for(let a=0;a<particles.length;a++){

        for(let b=a+1;b<particles.length;b++){

            const dx=particles[a].x-particles[b].x;

            const dy=particles[a].y-particles[b].y;

            const dist=Math.sqrt(dx*dx+dy*dy);

            if(dist<130){

                ctx.beginPath();

                ctx.moveTo(particles[a].x,particles[a].y);

                ctx.lineTo(particles[b].x,particles[b].y);

                ctx.strokeStyle=`rgba(124,92,255,${
                    1-dist/130
                })`;

                ctx.lineWidth=.5;

                ctx.stroke();

            }

        }

    }

}

function animate(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{

        p.update();

        p.draw();

    });

    mouseEffect();

    connect();

    requestAnimationFrame(animate);

}

animate();