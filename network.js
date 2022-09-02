class NeuralNetwork{
    constructor(neuronCounts){//neuron count shows the number of neurons of each layer
        this.levels=[];
        for (let i = 0; i < neuronCounts.length-1; i++) {
            this.levels.push(new Level(
                neuronCounts[i], neuronCounts[i+1]
            ));
        }
    }
    static feedforward(givenInputs, network){
        let outputs = Level.feedforward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedforward(outputs, network.levels[i]);
        }
        return outputs;
        //this places the outputs of the previous level into the new level as the input
        //and the final input will tell us if the car should go forward backwards, left or right
    }

    //mutate the network
    static mutate(network,mutateRate=1){
        network.levels.forEach(level => {
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    mutateRate
                )
            }
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        mutateRate
                    )
                }
            }
        });
    }
}

class Level {
    constructor(inputCount, outputCount){
        this.inputs = new Array(inputCount); //Array housing input neurons; these inputs are the values we get form the car sensor
        this.outputs = new Array(outputCount); //Array housing output neurons; from the inputs, we need to compute the output based the defined weights and biases 
        this.biases = new Array(outputCount); //each output neuron has a biase, of which it will fire
        
        this.weights=[];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i]=new Array(outputCount);//for each input node there should output count number of connections
        }
        Level.#randomise(this); //temp test brain
    }
    static #randomise(level){
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j]=Math.random()*2-1;//set weight to a level between -1 and 1
            }
        }
        // Why incorporate negative values - reference the book on why negative values for weights
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i]=Math.random()*2-1;//set bias to a level between -1 and 1
        }
    }

    static feedforward(givenInputs, level){//compute outputs with a feed forward alogrithm
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i]=givenInputs[i]; //going through all level inputs for them to be set to the given inputs
        }
        for (let i = 0; i < level.outputs.length; i++) {//looping through every output
            //calculate the sum between the value of the inputs and the weights
            let sum=0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum+=level.inputs[j]*level.weights[j][i];
                //sum to add the product between the j-th input and the weight between the 
                //j-th input and the ith-output; we repeat this with every input neuron
            }
            if (sum>level.biases[i])//check if the sum is greater than the bias of the output neuron
                level.outputs[i] = 1;//set ouput neuron to 1, turning the output neuron on
            else
                level.outputs[i] = 0;//set ouput neuron to 0, turning the output neuron off
        }
        return level.outputs;
    }
}