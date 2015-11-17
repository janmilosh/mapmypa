$(function() {

  var width = 1000,
      height = 600,
      circleSmall,
      circleLarge,
      pathWidth = 0.25,
      dotColor,
      nonRetroFillColor = '#f59222',
      // fadeOutFillColor = '#f59222',
      retroFillColor = '#DD1B52',
      // fadeOutFillColor2 = '#DD1B52',
      time,
      timeOut = 500,
      attempts = 0

  Pusher.log = function(message) {
    if (window.console && window.console.log) {
      window.console.log(message);
    }
  };

  var pusher = new Pusher('6191e54206ff58d25359', {
    encrypted: true
  });
  // var pusher = new Pusher('761da62a8a4edd4c1de2', {
  //   encrypted: true
  // });

  var channel = pusher.subscribe('pa_channel');

  channel.bind('pa_event', function(data) {
    console.log(geodata[data.zipcode]);
    console.log(data.is_retrospective);
    if(data.is_retrospective) {
      dotColor = retroFillColor;
    } else {
      dotColor = nonRetroFillColor;
    }
    updateTime();
    addPointsToMap([geodata[data.zipcode]]);
  });


  var dataLength = busiestDayZipcodes.length;
  
  function setSizes() {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    if (windowWidth >= 1024) {
      width = windowWidth * 0.9;
    } else {
      width = 1000;
    }
    height = width * 0.6;
    circleSmall = 4 * width/1000;
    circleLarge = circleSmall;
    strokeWidth = 1;

    $('#usa-map').css({'height': height + 'px',
                       'width': width + 'px',
                       'margin-left': 'auto',
                       'margin-right': 'auto',
                       'margin-top': ((windowHeight-height)/2) + 'px'
                     });
  }

  setSizes();

  var projection = d3.geo.albersUsa()
    .scale(width * 1.2)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);

  var svgSelection = d3.select("#usa-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svgSelection.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);

  var group = svgSelection.append("g");

  var us = mapPath;

  group.selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
    .attr("d", path)
    .attr("class", "feature");

  group.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("class", "mesh")
    .attr("stroke-width", strokeWidth)
    .attr("d", path);

  function addPointsToMap(data) {
    circles = svgSelection.selectAll("circle")
      .data(data, function(d) {
        return d[0];
      });

    circles.enter()
      .append("circle");

    circles
      .attr("cx", function(d) {
        return projection([d[1], d[0]])[0];
      })
      .attr("cy", function(d) {        
        return projection([d[1], d[0]])[1];
      })
      .style("opacity", 1)
      .attr("fill", dotColor)
      .attr("r", 0)
      .transition()
      .ease("elastic", 3, 0.3)
      .duration(1000)
      .attr("r", circleSmall);

    circles.transition()
      .delay(55000)
      .duration(5000)
      .style("opacity", 0)
      .attr("r", circleLarge)
      .attr('fill', dotColor)
      .remove()

    circles.exit()
  }

  function updateTime() {
    var datetime = new Date(Date.now());
    var date = datetime.toLocaleDateString();
    var realTime = datetime.toLocaleTimeString();

    $('#date').text(date)
    $('#time').text(realTime);
  }

  function data_demo() {
    attempts ++;
    $('#attempts').text((attempts).toString() + ' PAs created');
    if (attempts % 20 === 0) {
      updateTime();
    }
    updateTime();

    // loop over data forever; loopy()
    if (attempts >= dataLength) {
      attempts = 0;
    }
    try {
      // busiest day zipcodes
      var lat = busiestDayZipcodes[attempts][0];
      var lon = busiestDayZipcodes[attempts][1];
      time = busiestDayZipcodes[attempts][2];
      addPointsToMap([[lat, lon]]);
    } catch(e) {
      console.log(attempts, e);
    }
  }

  function feedData(data_function) {
    data_function();
    setTimeout(function() {
      feedData(data_function);
    }, timeOut);
  }

  // feedData(data_demo);
});
