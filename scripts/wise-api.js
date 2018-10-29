(function() {
    // just for testing
    //debugger;
    //var parent = {node:{}};
    // just for testing

    var recordGraphs = true;
    var studentGraphs = {};
    var history = [
        {"fun": "load", "val":null, timestamp: Date.parse(new Date()), data:{}}
    ];
    //var thisNode = parent.node;

    if (typeof thisNode !== "undefined" && thisNode != null){
        //thisNode.history = history;
        //if (recordGraphs) thisNode.studentGraphs = studentGraphs;

        /** Called when leaving the table Node step */
        thisNode.finalize = function(callback) {
            var h = {"fun": "exit", "val":null, timestamp:Date.parse(new Date())};
            addToWISELog(h, null);
            callback();
        };
    }


    /** Logs button press and calls appropriate function */
    WISE_onclick = function (fun, e){
        //console.log(e);
        var h = {"fun": fun, "val":e.innerText != null && e.innerText.length > 0 ? e.innerText : e.value, timestamp:Date.parse(new Date())};
        var id = $(this).parent().attr("id") != null ? $(this).parent().attr("id") : null;
        addToWISELog(h, id);
        if (typeof window[fun] !== "undefined") window[fun](e);
    }

    /** When new graph data is given use this function to ensure that it is saved to the correct place */
    addToWISELog = function(h, id){
        var agent = world.agent

        var evt = {};
        evt.messageType = "event";
        evt.eventCategory = "userInteraction";
        evt.event = h.fun;
        evt.eventData = {
            elementId: id,
            newValue: h.val,
            ticks: world.ticks,
            pos: world.agent != null ? world.agent.pos: null,
            balloon_displacement: world.agent.balloon != null ? world.agent.balloon.saved_displacement: null,
            mass: world.agent != null ? world.agent.mass: null,
            friction: world.agent != null ? world.agent.friction: null,
            wheel_radius: world.agent != null ? world.agent.wheel_radius: null,
            target_pos: world.target != null ? world.target.pos: null,
            previous_score: world.previous_score,
            attemptNum: world.attemptNum,
            series:h.fun == "Score" ? cloneDataArray(agent.data) : null

        };
        console.log(h.fun,evt);
        history.push(evt);
        // update state
        if (typeof parent !== "undefined" && typeof window.postMessage !== "undefined"){
            window.postMessage(evt, "*");
        }
    }

    function cloneDataArray(obj){
        if (obj == null || typeof obj !== "object") return obj;
        var copy = obj.constructor();

        for (var i = 0; i < obj.length; i++){
            var cell = {};
            for (var attr in obj[i]){
                cell[attr] = obj[i][attr];
            }
            copy.push(cell);
        }
        return copy;
    }

    function cloneHistory(obj) {
        if (obj == null || typeof obj !== "object") return obj;
        var copy = obj.constructor();

        for (var i = 0; i < obj.length; i++){
            var cell = {};
            for (var attr in obj[i]){
                cell[attr] = obj[i][attr];
            }
            copy.push(cell);
        }
        return copy;
    }

})();