$(function() {

  var width = 1000,
      height = 600,
      circleSmall,
      circleLarge,
      pathWidth = 0.25,
      dotColor,
      prescriberFillColor = '#f78126',
      pharmacyFillColor = '#dd1b52',
      attempts = 0

  Pusher.log = function(message) {
    if (window.console && window.console.log) {
      window.console.log(message);
    }
  };
  // internal demo pusher
  var pusher = new Pusher('a2fd2a2b275b3d4d1d98', {
    encrypted: true
  });

  // real data pusher
  // var pusher = new Pusher('761da62a8a4edd4c1de2', {
  //   encrypted: true
  // });

  var channel = pusher.subscribe('pa_channel');

  channel.bind('pa_event', function(data) {
    if(data.is_retrospective) {
      dotColor = pharmacyFillColor;
    } else {
      dotColor = prescriberFillColor;
    }
    try {
      addPointsToMap([geodata[data.zipcode]]);
    } catch(e) {
      console.log(data.zipcode + 'is not a valid zipcode.')
    }
  });
  
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

  updateTime();
  
  function updateTime() {
    var datetime = new Date(Date.now());
    var date = datetime.toLocaleDateString();
    var time = datetime.toLocaleTimeString();

    $('#date').text(date)
    $('#time').text(time);
    setTimeout(function() {
      updateTime();
    }, 1000);
  }

  // reloadPage();

  // function reloadPage() {
  //   setTimeout(function() {
  //     document.location.reload(true);
  //   }, 3600000);
  // }
});
