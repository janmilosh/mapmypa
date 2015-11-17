$(function() {

  var width = 1000,
      height = 600,
      circleSmall = 6,
      circleLarge = 12,
      pathWidth = 0.25;


  function setSizes() {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    if (windowWidth >= 1024) {
      width = windowWidth * 0.9;
    } else {
      width = 1000;
    }
    height = width * 0.6;
    circleSmall = 5 * width/1000;
    circleLarge = circleSmall * 2;
    strokeWidth = width/1000;

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

  d3.json("us.json", function(error, us) {

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

  });

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
      .attr("fill", '#F59222')
      .attr("r", 0)
      .transition()
      .duration(1000)
      .attr("r", circleSmall);
      
    circles.transition()
      .delay(3000)
      .duration(4000)
      .style("opacity", 0)
      .attr("r", circleLarge)
      .remove()

    circles.exit()
  };

  //This is just for testing purposes, allows the feed rate to be input 
  //from the UI

  var timeOut = 60;
  var attempts = 0;
  var fails = 0;
  $('#rate-output').text((60000/timeOut).toString() + ' points/minute');
  
  $('button').on('click', function() {
    var ppm = parseInt($('#rate-input').val());
    if (ppm > 0 && ppm <=3000) {
      timeOut = 60000/ppm;
      $('#rate-output').text(ppm.toString() + ' points/minute');
    } else {
      $('#rate-output').text('Let\'s stick with ' + (60000/timeOut).toString() + '!');
    }
    feedData();
    $('#rate-input').val('')
  });

  function feedData() {
    attempts ++;
    $('#attempts').text((attempts).toString() + ' attempts');
    try {
      var zipcode = randomNumber(210, 99951).toString();
      if (zipcode.length === 3) {
        zipcode = '00' + zipcode;
      }
      if (zipcode.length === 4) {
        zipcode = '0' + zipcode;
      }
      addPointsToMap([geodata[zipcode]]);
    }
    catch (e) {
       //console.log(e);
       //console.log('invalid zipcode:', zipcode);
       fails ++;
    }
    $('#fails').text((fails).toString() + ' fails');
    setTimeout(function() {
      feedData()
    }, timeOut);
  }

  feedData();

  function randomNumber(minNum, maxNum) {
    return Math.floor((Math.random() * maxNum) + minNum);
  }

  //console.log('The latitude data test passes: ', geodata['00210'][0] === 43.005895);
  //console.log('The longitude data test passes: ', geodata['00210'][1] === -71.013202);

});
