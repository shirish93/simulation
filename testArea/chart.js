var IFrameWin;
var legendHolder =[];
window.Agents = [];
var myLiveChart;
window.subscribe;

var getZeroArr = function(n) {
    return Array.apply(null, Array(n)).map(Number.prototype.valueOf, 0)
}

//Dummy function to avoid branching.
var readyFunc = function() {
    return [0, 0];
}


var getRandomColor = function() {
    return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
};


function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);

    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    return result;
}

var canvas = document.getElementById('updating-chart'),
    ctx = canvas.getContext('2d'),
    startingData = {
        labels: getZeroArr(100),
        datasets: []
    },
    latestLabel = '';


function setupChartData() {
    var agents = IFrameWin.Model.data.states;
    var data = []
    for (var i = 0; i < agents.length; i++) {
        var myColor = getRandomColor();
        var thisAgent = {
            label: agents[i].name + " ("+agents[i].icon + ")",
            fillColor: convertHex(myColor, 0.2),
            pointColor: convertHex(myColor, 1),
            strokeColor: myColor,
            pointStrokeColor: "#fff",
            data: getZeroArr(100)
        }
        data.push(thisAgent);
    }
    startingData.datasets = data;
}

function registerLabelsChanged(){
    subscribe("/ui/updateStateHeaders", function(){
        /*
        var labels = [];
        var agents = IFrameWin.Model.data.states;
        for (var i=0; i<agents.length; i++){
            labels.push(agents[i].name + " ("+agents[i].in0272436con + ")");
        }
        console.log(labels);
        //myLiveChart.config.data.labels = labels
        //myLiveChart.update()*/
    })
    

    
}

function startChart(){
    // Reduce the animation steps for demo clarity.
    window.myLiveChart = new Chart(ctx).Line(startingData, {
        animationSteps: 20,
        scaleUse2Y: true
    });

    legendHolder = document.createElement('div');
    legendHolder.innerHTML = myLiveChart.generateLegend();

    document.getElementById("legend").innerHTML = "";
    document.getElementById('legend').appendChild(legendHolder.firstChild);

    setInterval(function() {
        // Add two random numbers for each dataset
        var results = IFrameWin.Grid.countAgents();
        myLiveChart.addData(results, '');
        // Remove the first point so we dont just add values forever
        myLiveChart.removeData();
    }, 200);    
}

window.notifyParent = function() {
    console.log("The child has loaded inside iFrameWin!")
    readyFunc = IFrameWin.Grid.countAgents;
    

    window.Agents = IFrameWin.Model.data.states;
    window.subscrbe = IFrameWin.subscribe;


    setupChartData();
    startChart();
    registerLabelsChanged();
    started = true;
}
/*subscribe("ui/updateStateHeaders",function(title, message){
        console.log("I LEARNED HOW TO SUBSCRIBE!"); 
        console.log(title);
        console.log(message);
});*/
