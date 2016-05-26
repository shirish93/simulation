var IFrameWin;
var legendHolder = [];
window.Agents = [];
var myLiveChart;
window.subscribe;
window.started = false;
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

var tempArr = []
for (var i = 0; i < 100; i++) {
    tempArr.push("")
}

var canvas = document.getElementById('updating-chart'),
    ctx = canvas.getContext('2d'),
    startingData = {
        labels: tempArr,
        datasets: []
    },
    latestLabel = '';


function setupChartData() {
    var agents = IFrameWin.Model.data.states;
    var dataz = []
    for (var i = 0; i < agents.length; i++) {
        var myColor = getRandomColor();
        var thisAgent = {


            label: agents[i].name + " (" + agents[i].icon + ")",
            borderColor: myColor, //convertHex(myColor, 0.2),
            pointColor: convertHex(myColor, 1),
            pointStrokeColor: "#fff",
            fill: true,
            pointRadius: 0,
            data: getZeroArr(100),
            yAxisID: "y-axis-0"

        }
        dataz.push(thisAgent);
    }
    startingData.datasets = dataz;
}


function labelsChanged() {
    var labels = [];
    var agents = IFrameWin.Model.data.states;
    console.log(agents.length);
    for (var i = 0; i < agents.length; i++) {
        var name = agents[i].name + " (" + agents[i].icon + ")";
        myLiveChart.data.datasets[i].label = name;

    }
    myLiveChart.update();
}
Chart.defaults.global.tooltips.enabled = false;
Chart.defaults.line.scaleUse2Y = true;
Chart.defaults.line.scales.yAxes= [{type:"linear","id":"y-axis-0"}, {type:"linear","id":"y-axis-1", position:"right"}]

function startChart() {
    // Reduce the animation steps for demo clarity.
    window.myLiveChart = new Chart(ctx, {
        animationSteps: 5,
        type: "line",
        scaleUse2Y: true,
        data: startingData,

    });
    setInterval(function() {
        var results = IFrameWin.Grid.countAgents();

        for (var i = 0; i < results.length; i++) {

            myLiveChart.data.datasets[i].data.shift();
            myLiveChart.data.datasets[i].data.push(results[i]);
        }
        myLiveChart.update();
    }, 200);
}

var toDelData = [];
var newStateAdded = function(newStateID) {
    console.log("New state was added!")

    var myColor = getRandomColor();
    var agent = IFrameWin.Model.getStateByID(newStateID)
    var thisAgent = {
        label: agent.name + " (" + agent.icon + ")",
        borderColor: myColor, //convertHex(myColor, 0.2),
        pointColor: convertHex(myColor, 1),
        pointStrokeColor: "#fff",
        fill: true,
        pointRadius: 0,
        data: getZeroArr(100),
        yAxisID: "y-axis-1"

    }
    myLiveChart.data.datasets.push(thisAgent);
    myLiveChart.update();
}

var stateRemoved = function(oldStateID) {
    var agents = IFrameWin.Model.data.states;
    var index = 0;
    for (var i = 0; i < agents.length; i++) {
        if (oldStateID.id == i) {
            index = i;
        }
    }
    myLiveChart.data.datasets.splice(i, 1);
    myLiveChart.update();
}

function axisChanged(axisName, stateID){
    console.log(axisName);
    //console.log(stateID);
    var agents = IFrameWin.Model.data.states;
    var index = 0;
    for (var i = 0; i < agents.length; i++) {
        if (stateID.id == i) {
            index = i;
        }
    }
    console.log("old axis: ")
    console.log(myLiveChart.data.datasets[index].yAxisID);
    console.log("new axis: ");
    console.log(axisName);
    myLiveChart.data.datasets[index].yAxisID = axisName;
    var temp = myLiveChart.data.datasets[index];
    myLiveChart.update();

}


window.notifyParent = function() {
    console.log("The child has loaded inside iFrameWin!")
    readyFunc = IFrameWin.Grid.countAgents;
    window.Agents = IFrameWin.Model.data.states;
    
    setupChartData();
    startChart();
    registerEvents();
    window.started = true;
}

function fieldResized(){
    console.log("field resized!");
}

function registerEvents() {
    subscribe("/ui/addState", newStateAdded);
    subscribe("/ui/removeState", stateRemoved);
    subscribe("/ui/updateStateHeaders", labelsChanged);
    subscribe("/resizeField", fieldResized);
    subscribe("/graph/axisChanged", axisChanged);
}