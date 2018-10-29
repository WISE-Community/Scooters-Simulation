var world, stage;
var plot1, plot2;
var worldSpecs = {
  settings:{
    SCALE: 10,
    max_pos:10,
    min_pos:0,
    numAttemptsPerTarget:5
  },
  animation:{
    agent:{balloon:{constant:100}, pos:0}
    //,target:{pos: 8}
  },
  uivars:{
    mass:{value:10, in_ui:true, in_table:true, name:"mass", min:1, max:20, step:0.1},
    friction:{value:0.25, in_ui:true, in_table:true, name:"friction", min:0, max:0.5, step:0.01},
    wheel_radius:{value:1, in_ui:true, in_table:true, name:"wheel radius", min:1, max:2, step:1}
  },
  plot1:{
    chart:{
      type: 'line',
      zoomType: '',
      height: 300,
      width: 400,
      marginRight: 40,
      renderTo:'plot1'
    },
    credits:{enabled:false},
    title: {text: "Current Trial", style:{"color": "#333333", "fontSize": "14px"}},
    legend:{enabled:true},
    xAxis: {
      title: {
        text: "Time (seconds)",
        style:{
          color:"#222222",
          fontWeight:"bold"
        }},
      min: 0,
      max: 10,
      ceiling:60,
      tickColor:"#222222",
      lineColor:"#222222",
      labels:{
        style:{
          color:"#222222",
          fontWeight:"bold"
        }
      }
    },
    yAxis: {
      title: {text: "Energy (kilojoules)",style:{
          color:"#222222",
          fontWeight:"bold"
        }},
      showLastLabel: true,
      min: 0,
      max: 60,
      tickColor:"#222222",
      lineColor:"#222222",
      labels:{
        style:{
          color:"#222222",
          fontWeight:"bold"
        }
      }
    },
    series: [
      {id:"potential", name:"Potential", type: 'line', color:"#8888FF", lineWidth:4, data:[], allowPointSelect:false, turboThreshold:2000},
      {id:"kinetic", name:"Kinetic", type: 'line', color:"#88FF88",data:[], allowPointSelect:false, turboThreshold:2000},
      {id:"thermal", name:"Thermal", type: 'line', color:"#FF8888",data:[], allowPointSelect:false, turboThreshold:2000}
    ],
    tooltip: {
      formatter:function(){return 'Time: <b>'+this.x.toFixed(1)+' </b>seconds<br/>Energy:   <b>'+this.y.toFixed(1)+' </b>kilojoules<br/>';}
    }
  },
  plot2:{
    chart:{
      type: 'line',
      zoomType: '',
      height: 300,
      width: 400,
      marginRight: 40,
      renderTo:'plot2',
    },
    credits:{enabled:false},
    title: {text: "Last Trial", style:{"color": "#333333", "fontSize": "14px"}},
    legend:{enabled:true},
    xAxis: {
      title: {
        text: "Time (seconds)",
        style:{
          color:"#222222",
          fontWeight:"bold"
        }},
      min: 0,
      max: 10,
      ceiling:60,
      tickColor:"#222222",
      lineColor:"#222222",
      labels:{
        style:{
          color:"#222222",
          fontWeight:"bold"
        }
      }
    },
    yAxis: {
      title: {text: "Energy (kilojoules)",style:{
          color:"#222222",
          fontWeight:"bold"
        }},
      showLastLabel: true,
      min: 0,
      max: 60,
      tickColor:"#222222",
      lineColor:"#222222",
      labels:{
        style:{
          color:"#222222",
          fontWeight:"bold"
        }
      }
    },
    series: [
      {id:"potential", name:"Potential", type: 'line', color:"#8888FF", lineWidth:4, data:[], allowPointSelect:false, turboThreshold:2000},
      {id:"kinetic", name:"Kinetic", type: 'line', color:"#88FF88",data:[], allowPointSelect:false, turboThreshold:2000},
      {id:"thermal", name:"Thermal", type: 'line', color:"#FF8888",data:[], allowPointSelect:false, turboThreshold:2000}
    ],
    tooltip: {
      formatter:function(){return 'Time: <b>'+this.x.toFixed(1)+' </b>seconds<br/>Energy:   <b>'+this.y.toFixed(1)+' </b>kilojoules<br/>';}
    }
  }
}

var isDragging = false;

function init(params){
  var alreadyVisited = false;
  worldSpecs.version = params.version;
  //if (stage != null) alreadyVisited = true;
  if (worldSpecs.version === "p") {
    worldSpecs.plot1.series.splice(1,2);
    worldSpecs.plot2.series.splice(1,2);
  } else if (worldSpecs.version === "pk") {
    worldSpecs.plot1.series.splice(2,1);
    worldSpecs.plot2.series.splice(2,1);
  } else if (worldSpecs.version === "pkt") {
  }

  plot1 = new Highcharts.Chart(worldSpecs.plot1);
  plot2 = new Highcharts.Chart(worldSpecs.plot2);

  $("#plot1").mousedown(function(e) {
    mouse_on_graph(e);
  })
    .mousemove(function(e) {
      if (isDragging){
        mouse_on_graph(e);
      }
    })
    .mouseup(function() {
      isDragging = false;
    });


  var uiWidth = 200;
  var w = uiWidth-40;
  var cur_x = 20;
  var cur_y = 10;
  var max_x = 0;
  var max_y = 0;

  $("#slider_crank").slider({
    orientation:"horizontal",
    range: "min",
    min: 0,
    max: 100,
    value: 0,
    step: 10,
    slide: function(event, ui){
      var key = event.target.id.replace("slider_","");
      updateInitial();
      //WISE_onclick('slide_'+key,ui);
    },
    change: function (event, ui){
      var key = event.target.id.replace("slider_","");
      updateInitial();
      WISE_onclick('slide_change_'+key,ui);
    }


  });
  $("#button_run").button().click(function(){
    var h = {"fun": "Run", "val":$(this).text(), timestamp:Date.parse(new Date())};
    addToWISELog(h, $(this).attr("id"));
  });
  $("#button_pause").button().click(function(){
    var h = {"fun": "Pause", "val":$(this).text(), timestamp:Date.parse(new Date())};
    addToWISELog(h, $(this).attr("id"));
  });
  $("#dialog" ).dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    closeOnEscape: false,
    open: function(event, ui) {
      $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
    },
    buttons: {
      "I Understand": function(e) {
        WISE_onclick('button_understand',e.currentTarget);
        $( this ).dialog( "close" );
      }
    }
  });

  $("#congrats" ).dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    closeOnEscape: false,
    open: function(event, ui) {
      $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
    },
    buttons: {
      "Let's go!": function(e) {
        if (world.attemptNum == 1){
          WISE_onclick('button_newtarget',e.currentTarget);
        }
        $( this ).dialog( "close" );
      }
    }
  });

  for (var uikey in worldSpecs.uivars){
    uivar = worldSpecs.uivars[uikey];
    // are we displaying this in the ui area?
    if ((typeof uivar.in_ui !== "undefined" && uivar.in_ui) || (typeof uivar.type !== "undefined" && uivar.type.length > 0)){
      // what type of element is it, can be set explicitly or inferred
      uivar.type = typeof uivar.type !== "undefined" ? uivar.type : (typeof uivar.max !== "undefined" ? "slider" : "button");
      var position = typeof uivar.position !== "undefined" ? uivar.position : null;
      var html;
      if (!alreadyVisited){
        if (uivar.type == "slider"){
          var w = uiWidth-40;
          var lw = w;
          // two levels?
          if (Math.abs(uivar.max - (uivar.min + uivar.step)) < 0.01){
            w = 40;
          }
          var name = typeof uivar.name !== "undefined"? uivar.name : uikey;
          // label
          html = '<div id="slabel_' + uikey + '" style="font:18px Arial;text-align:center;padding-bottom:5px;color:#444444;width:' + lw + 'px;">'+ name + ': <span id="svalue_' + uikey + '" style="color:#FF0000;">'+uivar.value+'</span></div>';
          $("#uielems").append(html);
          // slider
          html = '<div id="' + uivar.type + '_' + uikey + '" name="'+name+'" style="width:' + w + 'px; margin-left:' + (lw-w)/2 + 'px;"></div>';
          $("#uielems").append(html);
          // min, cur, text
          html = '<table style="padding-bottom:10px;width:' + w + 'px; margin-left:' + (lw-w)/2 + 'px;"><tbody><tr><td>'+uivar.min+'</td><td style="text-align:right">'+uivar.max+'</td></tr></tbody></table';
          $("#uielems").append(html);

        } else if (uivar.type == "button"){
          html = '<input type="submit" id="' + uivar.type + '_' + uikey + '" value="' + uivar.value + '"/>';
          $("#uielems").append(html);
        }
      }

      if (uivar.type == "slider"){
        var uimin = typeof uivar.min !== "undefined"?uivar.min:0;
        var uimax = typeof uivar.max !== "undefined"?uivar.max:1;
        var slider = $("#slider_"+uikey).slider({
          orientation: typeof uivar.orientation !== "undefined"?uivar.orientation:"horizontal",
          range: typeof uivar.range !== "undefined"?uivar.range:"min",
          min: uimin,
          max: uimax,
          value: typeof uivar.value !== "undefined"?uivar.value:0,
          step: typeof uivar.step !== "undefined"?uivar.step:(uimax-uimin)/20,
          slide: function(event, ui){
            var key = event.target.id.replace("slider_","");
            worldSpecs.uivars[key].value = ui.value;
            $('#svalue_'+key).html(ui.value);
            updateInitial();
            //WISE_onclick('slide_'+key,ui);
          },
          change: function (event, ui){
            var key = event.target.id.replace("slider_","");
            worldSpecs.uivars[key].value = ui.value;
            $('#svalue_'+key).html(ui.value);
            //updateInitial();
            WISE_onclick('slide_change_'+key,ui);
          }
        });

      }
    }
  }

  //// EASELJS
  var canvas = $("#canvas");
  stage = new createjs.Stage(canvas[0]);

  world = new createjs.Container();
  world.width_px = canvas.width();
  world.height_px = canvas.height()-10;
  world.SCALE = world.width_px / (worldSpecs.settings.max_pos-worldSpecs.settings.min_pos);

  var g = new createjs.Graphics();
  g.clear().setStrokeStyle(1).beginStroke("#0000FF").beginFill("#EEEEFF").drawRect(0,0,world.width_px,world.height_px).endStroke().endFill();
  g.beginStroke("#887744").beginFill("#887744").drawRect(0,world.height_px,world.width_px,10).endFill().endStroke();
  world.shape = new createjs.Shape(g);
  world.shape.cache(0, 0, world.width_px, world.height_px+10);
  world.addChild(world.shape);

  // objects in world
  if (worldSpecs.animation.target != null){
    var target = world.target = new createjs.Shape();
    for (var attr in worldSpecs.animation.target){
      target[attr] = worldSpecs.animation.target[attr];
    }
    if (target.pos == null) target.pos = 10;
    target.height_px = 10;
    target.width_px = worldSpecs.animation.agent.max_width_px != null ? worldSpecs.animation.agent.max_width_px : 100;
    world.addChild(target);
    drawTarget(target);
  }

  // spring if in world
  if (worldSpecs.animation.spring != null){
    var spring = world.spring = new createjs.Container();
    for (var attr in worldSpecs.animation.spring){
      spring[attr] = worldSpecs.animation.spring[attr];
    }
    if (spring.max_width_px == null) spring.max_width_px = 100; // original height
    if (spring.max_height_px == null) spring.max_height_px = 40; // original width
    var shape = new createjs.Shape();
    spring.shape = shape;
    spring.addChild(shape);
    world.addChild(spring);

  }

  if (worldSpecs.animation.agent != null){
    var agent = world.agent = new createjs.Container();
    for (var attr in worldSpecs.animation.agent){
      agent[attr] = worldSpecs.animation.agent[attr];
    }
    // load up slider values
    if ($("#slider_mass").length > 0){
      agent.mass = $("#slider_mass").slider("option", "value");
    }
    if ($("#slider_friction").length > 0){
      agent.friction = $("#slider_friction").slider("option", "value");
    }
    if ($("#slider_wheel_radius").length > 0){
      agent.wheel_radius = $("#slider_wheel_radius").slider("option", "value") * 0.3;
    }
    if (agent.pos == null){
      agent.pos = 0;
    }
    agent.init_pos = agent.pos;
    if (agent.max_width_px == null) agent.max_width_px = 100;
    if (agent.max_height_px == null) agent.max_height_px = agent.wheel_radius * world.SCALE;
    agent.base = new createjs.Shape();
    agent.front_wheel = new createjs.Shape();
    agent.back_wheel = new createjs.Shape();
    if (agent.balloon != null){
      agent.balloon.shape = new createjs.Shape();
      agent.balloon.max_width_px = agent.max_width_px;
      agent.balloon.min_height_px = agent.max_width_px * 0.1;
      agent.balloon.max_height_px = agent.max_width_px * 0.9;
      agent.addChild(agent.balloon.shape);
    }
    agent.addChild(agent.base);
    agent.addChild(agent.front_wheel);
    agent.addChild(agent.back_wheel);
    world.addChild(agent);
  }

  world.previous_score = null;
  world.attemptNum = 1;

  updateInitial();

  stage.addChild(world);
  stage.needs_to_update = true;

  // setup table
  this.trial_count = 0; //increments in newTrial
  this.tableData = [];
  for (var key in worldSpecs.uivars){
    if ((typeof worldSpecs.uivars[key].in_table !== "undefined" && worldSpecs.uivars[key].in_table) || typeof worldSpecs.uivars[key].table_name !== "undefined" || typeof worldSpecs.uivars[key].table_value !== "undefined"){
      worldSpecs.uivars[key].in_table = true;
      var name = typeof worldSpecs.uivars[key].table_name === "string" ? worldSpecs.uivars[key].table_name : (typeof worldSpecs.uivars[key].name === "string" ? worldSpecs.uivars[key].name : key);
      worldSpecs.uivars[key].table_name = name;
      var cell = {text:name,  uneditable:true};
      if (typeof worldSpecs.uivars[key].table_style === "string")
        cell.style = worldSpecs.uivars[key].table_style;
      this.tableData.push([cell]);
    } else {
      worldSpecs.uivars[key].in_table = false;
    }
  }

  //createjs.Ticker.setFPS(24);
  createjs.Ticker.addEventListener("tick", tick);
}
function slide_change_mass(e){
  world.agent.mass = e.value;
  updateInitial();
}
function slide_change_friction(e){
  world.agent.friction = e.value;
  updateInitial();
}
function slide_change_wheel_radius(e){
  world.agent.wheel_radius = e.value * 0.3;
  updateInitial();
}
function mouse_on_graph(e){
  // do we have data?
  if (plot1.series[0].data.length > 0 && world.trialCompleted){
    isDragging = true;
    var series = plot1.series[0];
    e = plot1.pointer.normalize(e);
    var x = plot1.xAxis[0].toValue(e.chartX)
    var ticks = Math.round(x * createjs.Ticker.framerate);
    if (!world.isPaused){
      pause();
    }
    if (ticks < world.agent.data.length){
      world.ticks = ticks;
      //jv//plot1.series[1].setData([{x:world.agent.data[world.ticks].t, y:plot1.yAxis[0].min},{x:world.agent.data[world.ticks].t,y:plot1.yAxis[0].max}], true);
      var h = {"fun": "Graph-press", "val":world.agent.data[world.ticks].t, timestamp:Date.parse(new Date())};
      addToWISELog(h, null);
      drawWorldAtTick(world.ticks, true);
    }
  } else {
    isDragging = false;
  }
}
function button_newtarget (e){
  if (world.target != null){
    var oldpos = world.target.pos
    world.target.pos = world.agent.init_pos + 2 + Math.random() * (worldSpecs.settings.max_pos - world.agent.init_pos - 2);
    if (Math.abs(world.target.pos - oldpos) < 1){
      if (oldpos > worldSpecs.settings.max_pos/2){
        world.target.pos -= 2;
      } else{
        world.target.pos += 2;
      }
    }
    drawTarget(world.target);
  }
  stage.needs_to_update = true;
}

/** Funciton to setup initial conditions of the world based upon "crank value" which tells us how much potential energy is being put into system.
 Calculate initial potential:
 Elastic = 0.5 * k • disp^2 (where k is spring constant, disp is compression)
 */
function updateInitial(){
  if (world.isRunning){
    // we do this when a trial is ended, restart crank, send data to plot 2
    var data0 = [], data1 = [], data2 = [];
    for (var i = 0; i < plot1.series[0].data.length; i++){
      if (worldSpecs.version === "p") {
        data0.push({x:plot1.series[0].data[i].x, y:plot1.series[0].data[i].y});
      } else if (worldSpecs.version === "pk") {
        data0.push({x:plot1.series[0].data[i].x, y:plot1.series[0].data[i].y});
        data1.push({x:plot1.series[1].data[i].x, y:plot1.series[1].data[i].y});
      } else if (worldSpecs.version === "pkt") {
        data0.push({x:plot1.series[0].data[i].x, y:plot1.series[0].data[i].y});
        data1.push({x:plot1.series[1].data[i].x, y:plot1.series[1].data[i].y});
        data2.push({x:plot1.series[2].data[i].x, y:plot1.series[2].data[i].y});
      }
      //data0.push({x:plot1.series[0].data[i].x, y:plot1.series[0].data[i].y});
      //data1.push({x:plot1.series[1].data[i].x, y:plot1.series[1].data[i].y});
      //data2.push({x:plot1.series[2].data[i].x, y:plot1.series[2].data[i].y});
    }
    if (worldSpecs.version === "p") {
      plot2.series[0].setData(data0, true);
    } else if (worldSpecs.version === "pk") {
      plot2.series[0].setData(data0, false);
      plot2.series[1].setData(data1, true);
    } else if (worldSpecs.version === "pkt") {
      plot2.series[0].setData(data0, false);
      plot2.series[1].setData(data1, false);
      plot2.series[2].setData(data2, true);
    }

    //plot2.series[0].setData(data0, true);
    //plot2.series[1].setData(data1, false);
    //plot2.series[2].setData(data2, true);
    if ($("#score").text() == ""){
      plot2.setTitle({text: "Last Trial: INCOMPLETE"})
    } else {
      if (world.target != null){
        plot2.setTitle({text: "Last Trial: " + world.previous_score + " m from target"});
      } else {
        plot2.setTitle({text: "Last Trial: " + world.previous_score + " m"});
      }
    }
    world.isRunning = false;
    $("#slider_crank").slider('value', 0); // setting this back to zero will trigger this function to be called again, but with world not running

  } else {
    var crankValue = $("#slider_crank").slider('value');
    var initial_potential = 0;
    if (world.agent != null){
      var agent = world.agent;
      agent.pos = agent.init_pos != null ? agent.init_pos : 0.2;
      agent.max_height_px = agent.wheel_radius * world.SCALE;
      agent.width_px = agent.max_width_px;
      agent.height_px = agent.max_height_px;
      if (agent.balloon != null){
        agent.balloon.width_px = agent.balloon.max_width_px;
        agent.balloon.height_px = agent.balloon.min_height_px + (agent.balloon.max_height_px - agent.balloon.min_height_px) * crankValue / 100;
        agent.balloon.displacement = (agent.balloon.height_px - agent.balloon.min_height_px) / world.SCALE;
        agent.balloon.saved_displacement = agent.balloon.displacement;
        initial_potential += 0.5 * agent.balloon.constant * Math.pow(agent.balloon.displacement,2);
      }
      drawCart(agent);
      agent.x = agent.pos * world.SCALE;
      agent.y = world.height_px - 1;
      agent.initial_potential = initial_potential;
      var data = calculateData();
      if (worldSpecs.version === "p") {
        plot1.series[0].setData(data.potential, true);
      } else if (worldSpecs.version === "pk") {
        plot1.series[0].setData(data.potential, false);
        plot1.series[1].setData(data.kinetic, true);
      } else if (worldSpecs.version === "pkt") {
        plot1.series[0].setData(data.potential, false);
        plot1.series[1].setData(data.kinetic, false);
        plot1.series[2].setData(data.thermal, true);
      }
      //plot1.series[0].setData(data.potential, true);
      //plot1.series[1].setData(data.kinetic, false);
      //plot1.series[2].setData(data.thermal, true);

    }
    world.isPaused = false;
    world.trialCompleted = false;
    $("#button_run").button('option', 'label', 'Run');
    $("#button_pause").button('option', 'label', 'Pause');
    // set score text
    $("#score").text("");
    //if(crankValue == 100 && $("#slider_crank").slider('value') < 100) $("#slider_crank").slider('value', 100);
    stage.needs_to_update = true;
  }
}

function drawTarget(target){
  var g = target.graphics;
  var divs = 9;
  var divwidth = target.width_px / divs;
  for (var i = 0; i < divs; i++){
    var color = i % 2 == 0 ? "#FF0000" : "#FFFFFF";
    g.beginStroke("#FF0000").beginFill(color).drawRect(-target.width_px/2 + i * divwidth,0,divwidth, target.height_px)
  }
  target.x = target.pos * world.SCALE;
  target.y = world.height_px;
}

function drawCart(agent){
  var width_px = agent.width_px;
  var height_px = agent.height_px;
  if (agent.balloon != null){
    var balloon = agent.balloon;
    balloon.shape.x = 0;
    balloon.shape.y = -height_px;
    var g = balloon.shape.graphics;

    g.clear()
      .beginFill("#AA8822").drawRect(width_px,-balloon.height_px/2,4,balloon.height_px/2+height_px/2).endFill()
      .beginFill("#2222FF").moveTo(-10,-balloon.height_px/2-10).lineTo(0, -balloon.height_px/2-2).lineTo(0, -balloon.height_px/2+2).lineTo(-10,-balloon.height_px/2+10).lineTo(-10,-balloon.height_px/2-10).endFill()
      .beginRadialGradientFill(["#8888FF","#0000FF"],[0,1],balloon.width_px/3,-balloon.height_px*0.9,0,balloon.width_px/3,-balloon.height_px*0.9,balloon.height_px)
      //.beginFill("red")
      .drawEllipse(0,-balloon.height_px,balloon.width_px,balloon.height_px).endFill()
      .beginFill("#6666FF").drawRoundRect(-10,-balloon.height_px/2-10,4,20,4).endFill()
    ;
    //balloon.shape.cache(-10, -balloon.height_px,balloon.width_px+4, 0);
  }
  var base = agent.base;
  var g = base.graphics;
  var radius = height_px / 2;
  g.clear()
    .beginLinearGradientFill(["#888888","#222222"],[0,1], 0, -height_px/2-4, 0, -height_px/2+4)
    .drawRect(0, -height_px/2-4, width_px, 8).endFill()

  base.cache(0, -height_px, width_px, height_px);
  var back_wheel = agent.back_wheel;
  back_wheel.x = radius + 4;
  back_wheel.y = -radius;
  g = back_wheel.graphics;
  g.clear()
    .beginLinearGradientFill(["#444444", "#AAAAAA","#444444"],[0,0.5,1], -radius, -radius, radius, radius)
    .drawCircle(0, 0, radius).endFill();
  back_wheel.cache(-radius,-radius,radius*2,radius*2);

  var front_wheel = agent.front_wheel;
  g = front_wheel.graphics;
  front_wheel.x = width_px - radius - 4;
  front_wheel.y = -radius;
  g.clear()
    .beginLinearGradientFill(["#444444", "#AAAAAA","#444444"],[0,0.5, 1], -radius, -radius, radius, radius)
    .drawCircle(0, 0, radius).endFill();
  front_wheel.cache(-radius,-radius,radius*2,radius*2);
}

function redrawCart(agent, distance_px){
  var width_px = agent.width_px;
  var height_px = agent.height_px;
  if (distance_px > 0){
    var diameter_px = height_px;
    //  | 1 rot   | * |360 d| * |dist m| = dist * 360
    //	|PI diam m|   |1 rot|              PI * diam
    var rotation = 360 * distance_px / (Math.PI * diameter_px);
    agent.front_wheel.rotation += rotation;
    agent.back_wheel.rotation += rotation;
  }
  if (agent.balloon != null){
    var balloon = agent.balloon;
    balloon.height_px = balloon.min_height_px + balloon.displacement * world.SCALE;
    balloon.shape.x = 0;
    balloon.shape.y = -height_px;
    var g = balloon.shape.graphics;
    var ph = balloon.displacement > 0 ? 4 : 2;
    g.clear()
      .beginFill("#AA8822").drawRect(width_px,-balloon.height_px/2,4,balloon.height_px/2+height_px/2).endFill()
      .beginFill("#2222FF").moveTo(-10,-balloon.height_px/2-10).lineTo(0, -balloon.height_px/2-ph).lineTo(0, -balloon.height_px/2+ph).lineTo(-10,-balloon.height_px/2+10).lineTo(-10,-balloon.height_px/2-10).endFill()
      .beginRadialGradientFill(["#8888FF","#0000FF"],[0,1],balloon.width_px/3,-balloon.height_px*0.9,0,balloon.width_px/3,-balloon.height_px*0.9,balloon.height_px)
      //.beginFill("red")
      .drawEllipse(0,-balloon.height_px,balloon.width_px,balloon.height_px).endFill()
      .beginFill("#6666FF").drawRoundRect(-10,-balloon.height_px/2-10,4,20,4).endFill()
    ;
    if (balloon.displacement > 0){
      g.beginLinearGradientFill(["rgba(200,200,250,0.1)","rgba(200,200,250,0.3)","rgba(200,200,250,0.5)"],[0,Math.random(),1],-150,-balloon.height_px/2-8,-10,-balloon.height_px/2+8).drawRect(-150,-balloon.height_px/2-8,140,16).endFill();
    }
    //balloon.shape.cache(-10, -balloon.height_px,balloon.width_px+4, 0);
  }
}

function run(){
  if (world.isRunning){
    updateInitial();
  } else {
    if ($("#slider_crank").slider('value') > 0){
      // setup world
      world.isRunning = true;
      world.isPaused = false;
      world.trialCompleted = false;
      world.ticks = 0;
      world.timestamp_beginAnimation = createjs.Ticker.getTime();
      $("#button_run").button('option', 'label', 'Restart');
    } else {
      $("#dialog").text("Make sure to add air to the balloon.").dialog("open");
    }
  }
}

/** Use potential, kinetic to create an array (calculatedData) of x, y, rotation
 *   Only go until we reach the y-max or the x-max
 *	Formulas used:
 *	Potential energy: Force x distance
 *		Gravitational: mass x gravity x height
 *		Elastic = 0.5 * k • disp^2 (where k is spring constant, disp is compression)
 *	Kinetic energy: 0.5 * mass * velocity^2
 *   Force:
 *		Elastic = k * disp
 *	Distance
 *		d = v_i * t + 0.5 * acc * t^2
 *   Velocity:
 *       v = sqrt(v0^2 + 2 * a * disp)
 */
function calculateData(){
  var max_x = worldSpecs.plot1.xAxis.max;
  var max_y = worldSpecs.settings.max_pos;
  var agent = world.agent;
  agent.data = []; // save data to agent
  data = {kinetic:[],potential:[],thermal:[],displacement:[],pos:[]} // save data in arrays for return
  if (world.spring != null){
    var spring = world.spring;
    spring.data = [];
  }
  var initial_displacement = agent.balloon.displacement;
  var t = 0;
  var dt = 1 / createjs.Ticker.framerate;
  var pos = world.agent.pos;
  var potential = 0.5 * agent.balloon.constant * Math.pow(agent.balloon.displacement, 2);
  agent.initial_potential = potential;
  var force = agent.balloon.constant * agent.balloon.displacement;
  var friction_force = agent.friction != null ? 9.8 * agent.mass * agent.friction : 0;
  var acceleration = force / agent.mass;
  var velocity = 0;
  var kinetic = 0;
  var thermal = 0;
  var previous_thermal = 0;
  while (t <= max_x){
    if (t > 0){
      var initial_potential = potential;
      var initial_velocity = velocity;
      agent.balloon.displacement = Math.max(agent.balloon.displacement - 0.05,  0);
      potential = 0.5 * agent.balloon.constant * Math.pow(agent.balloon.displacement, 2);
      var dpotential = initial_potential - potential;

      // now we will determine how much of the potential energy lost is distributed into kinetic and thermal.
      // will start by solving for distance traveled assuming no friction, then see how much friction was applied over this distance.
      // then remove the work of friction from the kinetic energy and repeat until we converge on kind of close approximation
      var dkinetic = dpotential;
      var dthermal = 0;
      for (var i = 0; i < 100; i++){
        var dkinetic_previous = dkinetic;
        velocity = Math.sqrt(2 * (kinetic + dkinetic )/ agent.mass);
        var dpos = (velocity + initial_velocity) / 2 * dt;
        // work done by friction
        dthermal = friction_force * dpos;
        dkinetic = dpotential - dthermal;
        //console.log("t",t,"i",i,"PE",dpotential, "KE",dkinetic, "HE",dthermal, "v",velocity, "p", dpos, "KEp", dkinetic_previous, "out",Math.abs(dkinetic - dkinetic_previous) );

        // if the thermal overwhelms the kinetic, we stop and make sure the energy is all conserved.
        if (kinetic + dkinetic < 0){
          dkinetic = -kinetic;
          dthermal = dpotential - dkinetic;
          velocity = 0;
          dpos = (velocity + initial_velocity) / 2 * dt;
          break;
        }
        // when the change in kinetic becomes stable across iterations we break
        if (Math.abs(dkinetic - dkinetic_previous) < 0.01) break;
      }
      kinetic += dkinetic;
      thermal += dthermal;
      pos += dpos;
    }

    var cell = {
      t: t,
      pos:pos,
      potential:potential,
      kinetic:kinetic,
      thermal:thermal,
      displacement:agent.balloon.displacement
    };

    agent.data.push(cell);
    data.pos.push({x:t, y:pos});
    data.potential.push({x:t, y:potential});
    data.kinetic.push({x:t, y:kinetic});
    data.thermal.push({x:t, y:thermal});
    data.displacement.push({x:t, y:agent.balloon.displacement});
    t += dt;
  }
  return data;
  //console.log(agent.data);
}

function pause(){
  if (world.isRunning){
    if (world.isPaused){
      //jv//plot1.series[1].setData([], true);
      $("#button_pause").button('option', 'label', 'Pause');
    } else {
      $("#button_pause").button('option', 'label', 'UnPause');
    }
    world.isPaused = !world.isPaused;
  }
}

function tick() {
  if (world != null && world.isRunning && !world.isPaused && !world.trialCompleted){
    if (world.ticks < world.agent.data.length){
      var drawGraphs = world.ticks % 5 == 0;
      var point = world.agent.data[world.ticks];

      drawWorldAtTick(world.ticks, drawGraphs);
      // if we are done moving show final distance
      if ($("#score").text() == "" && world.ticks > 0 && point.pos == world.agent.data[world.ticks-1].pos){
        showScore();
      }

      world.ticks++;
    } else {
      world.trialCompleted = true;
      var t = world.agent.data[world.agent.data.length-1].t;
      //jv//plot1.series[1].setData([{x:t, y:worldSpecs.plot1.yAxis.min},{x:t,y:worldSpecs.plot1.yAxis.max}], true);

      // show score
      if ($("#score").text() == ""){
        showScore();
      }
      //WISE_onclick("end-animation",{value:null});
      stage.needs_to_update = true;
    }

  }

  if (stage != null && stage.needs_to_update){
    stage.update();
    stage.needs_to_update = false;
  }
}

function showScore(){
  var dist = 0;
  if (world.target != null){
    dist = Math.abs(Math.round((world.agent.data[world.agent.data.length-1].pos - world.target.pos + world.agent.width_px /(2 * world.SCALE))*10)/10);
  } else {
    dist = Math.round(world.agent.data[world.agent.data.length-1].pos*10)/10;
  }
  var h = {"fun": "Score", "val":dist, timestamp:Date.parse(new Date())};
  addToWISELog(h, null);
  //$("#slider_crank").slider('value', 100);
  world.previous_score = dist;
  if (world.target != null){
    $("#score").text("Distance from target: " + world.previous_score + " meters");
    if (dist < 0.5){
      world.attemptNum = 1;
      $("#congrats").text("Great Job! You can try again with a new target.").dialog("open");
    } else {
      if (world.attemptNum < worldSpecs.settings.numAttemptsPerTarget){
        var chances = worldSpecs.settings.numAttemptsPerTarget - world.attemptNum;
        var chanceText = chances > 1 ? " more chances" : " more chance";
        world.attemptNum++;
        $("#congrats").html("Keep trying! You have " + chances + chanceText + " to hit the target.  <br/> <p style='color:red'><b>Hint: Look carefully at your graphs of energy.</b></p>").dialog("open");
      } else {
        world.attemptNum = 1;
        $("#congrats").text("Sorry. Try again with a new target.").dialog("open");
      }
    }
  } else {
    $("#score").text("Final Distance: " + dist + " meters");
    $("#congrats").html("Great job! You can try again with new slider values. <br/> <p style='color:red'><b>Hint: Look carefully at your graphs of energy.</p>").dialog("open");
  }
}

function drawWorldAtTick(tick, drawGraphs){
  if (tick < world.agent.data.length && world.isRunning){
    var agent = world.agent;
    // don't plot on every tick or else it will be too slow
    var point = agent.data[tick];
    agent.x = point.pos * world.SCALE;
    var distance = 0;
    if (tick > 0){
      distance = point.pos - agent.data[tick-1].pos;
    }
    if (agent.balloon != null){
      agent.balloon.displacement = point.displacement;
    }
    redrawCart(world.agent, distance * world.SCALE);
    // update spring if need be
    if (world.spring != null){
      var spring = world.spring;
      if (spring.data[tick].displacement > 0){
        drawSpring(spring, spring.max_width_px - world.SCALE * spring.data[tick].displacement, spring.max_height_px);
      }
    }
    stage.needs_to_update = true;
  }
}
