class Car {
    constructor(x, y, width, height, controlType,maxSpeed=3, colour="blue"){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
;
        this.stalking=false;
        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed=maxSpeed;
        this.friction=0.05;
        this.angle=0;
        this.damaged=false;

        this.useBrain=controlType=="AI";//if controlType is "AI" this.useBrain will be in use

        //disable sensor for dummy cars only
        if(controlType!="dummy"){
            this.sensor=new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 5, 4]//6 neurons on the hidden layer; 4 neurons for the output layer (1 for forward, 1 for backwards, 1 for left and 1 for right)
            );
        }
        //controls
        this.controls=new Controls(controlType);

        this.img=new Image();
        this.img.src = "car.png";
        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;
        
        const maskCtx = this.mask.getContext("2d");
        this.img.onload=()=>{
            maskCtx.fillStyle=colour;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation="destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);

            //keep the blue colour only where it overlaps with the blue colour with
            //the visible pixels of the car image
        }
    }

    update(roadBorders, traffic){
        if(!this.damaged){
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);

            //take out the offsets from the sensor readings (x, y, and the offset of where the reading was)
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
                //for neurons to receive low values if the object is far away
                //and higher values close to 1 if the object is close
            );
            const output=NeuralNetwork.feedforward(offsets, this.brain)
            
            if(this.useBrain){
                this.controls.forward=output[0];
                this.controls.left=output[1];
                this.controls.right=output[2];
                this.controls.reverse=output[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic){
        for (let i = 0; i<roadBorders.length; i++) {
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for (let i = 0; i<traffic.length; i++) {
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points=[];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });

        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });

        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });

        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    #move(){
        if(this.controls.forward){this.speed+=this.acceleration;}//accelerating when going forward
        if(this.controls.reverse){this.speed-=this.acceleration;}//accelarting when going backwards

        if(this.speed>0){
            this.speed-=this.friction;
            if(this.speed > this.maxSpeed){//speed cap upon accelerating
                this.speed=this.maxSpeed;
            }
        }
        if(this.speed<0){
            this.speed+=this.friction;
            if(this.speed < -this.maxSpeed/2){//speed cap upon reversing
                this.speed=-this.maxSpeed/2;//not negative speed, just indicating the car going backwards
            }
        }
        if(Math.abs(this.speed)<this.friction){//friction to stop car from moving back
            this.speed=0;
        }

        if(this.speed!=0){
            const flip=this.speed>0?1:-1;//angles to effect controls when reversing
            if(this.controls.left)
                this.angle+=0.03*flip;
            if(this.controls.right)
                this.angle-=0.03*flip;

            if(this.speed>0) {
                if(Math.abs(this.speed)<this.friction){
                    this.speed=0;
                }
                this.speed-=this.friction;
            }
            else if(this.speed<0)
                this.speed+=this.friction;
        } 
        this.x-=Math.sin(this.angle)*(this.speed);
        this.y-=Math.cos(this.angle)*(this.speed);
    }
    draw(ctx, drawSensor=false){
        /*ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2, 
            this.width,
            this.height,
        );
        ctx.fill();

        ctx.restore();*/
        // if(this.damaged){
        //     ctx.fillStyle="gray";
        // } else{
        //     ctx.fillStyle=color;
        // }
        // ctx.beginPath();
        // ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        // for (let i = 1; i < this.polygon.length; i++) {
        //     ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        // }
        // ctx.fill();

        
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged){
        ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.globalCompositeOperation="multiply";
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        ctx.restore();
    }
}