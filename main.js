const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 400;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = window.innerWidth- carCanvas.width;

// const rect = carCanvas.getBoundingClientRect();

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width/2, carCanvas.width*0.9, 5);
const cars = generateCars(200);
let mutationRate = !localStorage.getItem("currentMutation") ?  0.1 : localStorage.getItem("currentMutation");
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")){//checking if best brain exists in local storage
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain")//set the brain of the best car to this best brain
        )
        if(i >= 0){
            NeuralNetwork.mutate(cars[i].brain, mutationRate);
        }
    }
}
let trafficRows = 10;

let traffic = generateTraffic("constant", trafficRows, 0, 2) //generate random traffic

animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain)); 
    //serialising the best car's brain in local storage
}

function discard(){
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("currentMutation");
}

function generateCars(N){
    const cars = []
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(Math.floor(road.laneCount/2)), 100, 30, 50, "AI"));//x, y, width, height
    }
    return cars
}

function generateTraffic(type, Roadrows = 5, startRow = -bestCar.y, rowAmount){
    startRow = startRow > 0 ? startRow : -bestCar.y;
    rowAmount = rowAmount < road.laneCount ? rowAmount : 2;
    let trafficArr= [];
    let roadColumn;
    let r;

    if (type == "constant") {
        roadColumn = 0;
        for (let i = 0; i < Roadrows*rowAmount; i++) {
            if(i%rowAmount==0){
                r = (-200 * (i/rowAmount) + startRow);
            }
            roadColumn = roadColumn >= road.laneCount ? 0 : roadColumn
            trafficArr.push(new Car(road.getLaneCenter(roadColumn), r , 30, 50, "dummy",2, getRandomColour()))
            roadColumn+=1;
        }
    } else { //default set to random
        for (let i = 0; i < Roadrows*rowAmount; i++) {
            if(i%rowAmount==0){
                roadColumn = Math.floor(Math.random()*road.laneCount);
                r = (-200 * (i/rowAmount) + startRow);
            }
            roadColumn = roadColumn >= road.laneCount ? 0 : roadColumn
            trafficArr.push(new Car(road.getLaneCenter(roadColumn), r , 30, 50, "dummy",2, getRandomColour()))
            roadColumn+=1;
        }
    }
    return trafficArr
}

/*function checkStalking(){
    let currentDifference =0;
    let stalkingDifference =0;
    let running = false
    for (let i = 0; i < traffic.length; i++) {//check if any cars are stalking
        if(traffic[i].y < bestCar.y){
            if(bestCar.y - traffic[i].y < stalkingDifference){
                stalkingDifference = bestCar.y - traffic[i].y
                //console.log(bestCar.y)
                // rangeStart = stalkingDifference + 250//less than rangeStart
                // rangeEnd = stalkingDifference - 250 //more than rangeEnd
                running = true
            }
            currentDifference = bestCar.y - traffic[i].y
        }
    }
    if(-400 <= currentDifference - stalkingDifference <= 400 && running){
        return true;
    }
}*/

function animate(time){
    if(traffic[traffic.length-1].y > bestCar.y + trafficRows*15){
        mutationRate-=mutationRate*0.01
        localStorage.setItem("currentMutation", JSON.stringify(mutationRate));
        save();
        window.location.reload();
    }
    if (cars.filter((el) => {
        return el.damaged==false
    }).length == 0){
        mutationRate+=mutationRate*0.05
        localStorage.setItem("currentMutation", JSON.stringify(mutationRate));
        save();
        window.location.reload();
    }
    /*if (checkStalking) {
        mutationRate+=mutationRate*0.1
        localStorage.setItem("currentMutation", JSON.stringify(mutationRate));
        window.location.reload();
    }*/

    
    // for (let i = 0; i < traffic.length; i++) {//check if any cars are stalking
    //     if(traffic[i].y < bestCar.y){
    //         if(bestCar.y - traffic[i].y < difference){  
    //             difference = bestCar.y - traffic[i].y
    //             //console.log(bestCar.y)
    //             console.log(i)
    //             rangeStart = difference + 250//less than rangeStart
    //             rangeEnd = difference - 250 //more than rangeEnd
    //         }
    //         difference = bestCar.y - traffic[i].y
    //     }
    // }

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    
    //Defining best car as the car with the minimum y value
    //const bestCar = cars.find(//The lower the y value the more higher up the car is on the page
    //    c=>c.y==Math.min(
    //        ...cars.map(c=> c.y)//creating a new array with only the y values of the car
    //    )
    //)

    //setting the fitness function to find the car with the lowest y value
    //while being undamaged
    
    //y value as the road is straight and the further up the road the car moves,
    //the lower the y value; does not work for curved roads
    const sort_by = (field, reverse) => {
        const key = (x) => {
            return (x[field]);
        }
        reverse = !reverse ? 1 : -1;
        return function(a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    }
    cars.sort(sort_by("y", false)).sort(sort_by("damaged", false));
    bestCar = cars[0];
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.75);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
       traffic[i].draw(carCtx) 
    }
    carCtx.globalAlpha=0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;//using time to offset the line dash
    Visualiser.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate)
}