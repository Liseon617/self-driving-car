class Visualiser{
    static drawNetwork(ctx, network){
        const margin=50;
        const left=margin;
        const top=margin;
        const width=ctx.canvas.width-margin*2;
        const height=ctx.canvas.height-margin*2;

        /*Visualiser.drawLevel(ctx, 
            network.levels[0],
            left, top, 
            width, height);*/

        const levelHeight=height/network.levels.length;
        for (let i = network.levels.length-1; i >=0 ; i--) {
            const levelTop=top+
                lerp(
                    height - levelHeight,
                    0,
                    network.levels.length==1?0.5:i/(network.levels.length-1)
                );

            ctx.setLineDash([7,3])
            Visualiser.drawLevel(ctx, network.levels[i],
                left,levelTop,
                width,levelHeight,
                i==network.levels.length-1
                ?['\u21E7', "\u21E6",'\u21E8','\u21E9']
                :[]);
        }
    }

    static drawLevel(ctx, level, left, top, width, height, outputLabels){
        const right = left+width;
        const bottom = top+height;

        const {inputs, outputs, weights, biases} = level;
        const nodeRadius = 18;

        for (let i = 0; i < inputs.length; i++) {
            for(let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(Visualiser.#getNodeX(inputs, i, left, right),
                bottom);
                ctx.lineTo(Visualiser.#getNodeX(outputs, j, left, right), 
                top);
                ctx.lineWidth=2;
                //Yellow for positive weight values; Blue for negative weight values
                ctx.strokeStyle=getRGBA(weights[i][j]);
                ctx.stroke();
            }
        }

        for (let i = 0; i < inputs.length; i++) {
            const x=Visualiser.#getNodeX(inputs, i, left, right)
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI*2);
            ctx.fillStyle="#000";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius*0.6, 0, Math.PI*2);
            ctx.fillStyle=getRGBA(inputs[i]);
            ctx.fill();
        }
        for (let i = 0; i < outputs.length; i++) {
            const x=Visualiser.#getNodeX(outputs, i, left, right)
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, Math.PI*2);
            ctx.fillStyle="#000";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, top, nodeRadius*0.6, 0, Math.PI*2);
            ctx.fillStyle=getRGBA(outputs[i]);
            ctx.fill();

            //biases will be the contour of the outputs
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.arc(x, top, nodeRadius*0.80, 0, Math.PI*2);
            ctx.strokeStyle=getRGBA(biases[i]);
            ctx.setLineDash([3,3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if(outputLabels[i]){
                ctx.beginPath();
                ctx.textAlign="center";
                ctx.textBaseline="middle";
                ctx.fillStyle="#fff";
                ctx.strokeStyle="#000"
                ctx.font=(nodeRadius*1.35) + "px Arial";
                ctx.fillText(outputLabels[i], x, top);
                ctx.lineWidth=0.6;
                ctx.strokeText(outputLabels[i], x, top);
            }
        }
    }

    static #getNodeX (nodes, index, left, right){
        return lerp(
            left,
            right,
            nodes.length==1?0.5:index/(nodes.length-1)
        );
    }
}