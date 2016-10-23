/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 520;
  var margin = {top:0, left:20, bottom:40, right:10};

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main canvas, context used for visualization
  var canvas = null;
  var context = null;

  // The force simulation
  var simulation = null;

  // Node's radius
  var radius = 10;

  // Colors for clusters
  var color = d3.scaleOrdinal(d3.schemeCategory20);


  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(graph) {

      //Load Data
      setupVis(graph);
      loadImages(graph)

      // create svg and give it a width and height
      canvasEle = d3.select(this).selectAll("canvas").data([graph]);
      var svgEnter = canvasEle.enter().append("canvas");

      canvas = document.querySelector("canvas");
      context = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;


      simulation = d3.forceSimulation()
          // .force("link", d3.forceLink().id(function (d) { return d.id; } ).strength(0.6).distance(100))
          // .force("charge", d3.forceManyBody().strength(-1))
          //Better than forceCenter because I can control the strength

          .force("x", d3.forceX(width/2).strength(0.1))
          .force("y", d3.forceY(height/2).strength(0.1))
          // .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collide", d3.forceCollide(radius+1).iterations(4))
          // .force("forceX", d3.forceCenter(width / 2, height / 2));
          // .force("forceY", d3.forceCenter(width / 2, height / 2));


      // d3.json("ieeevisNetwork.json", function(error, graph) {

      // if (error) throw error;
      console.log("Clustering");
      // netClustering.cluster(graph.nodes, graph.links);
      console.log("done");
      var clusters = d3.nest()
        .key(function(d) { return d.cluster; })
        .entries(graph.nodes)
        .sort(function(a, b) { return b.values.length - a.values.length; });

      simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

      // simulation.force("link")
      //     .links(graph.links);

      d3.select(canvas)
          .call(d3.drag()
              .container(canvas)
              .subject(dragsubject)
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));




      setupSections();

      function ticked() {
        context.clearRect(0, 0, width, height);
        context.save();
        // context.translate(width / 2, height / 2);


        context.beginPath();
        graph.links.forEach(drawLink);
        context.strokeStyle = 'rgba(200,200,200,0.1)';
        context.lineWidth = 0.5;
        context.stroke();


        clusters.forEach(function(cluster) {
          context.beginPath();
          cluster.values.forEach(drawNode);
          context.fillStyle = color(cluster.key);
          context.fill();
        });

        context.restore();
      }

      function dragsubject() {
        return simulation.find(d3.event.x, d3.event.y);
      }
      // });

      function dragstarted() {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
      }

      function dragged() {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
      }

      function dragended() {
        if (!d3.event.active) simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      }

      function drawLink(d) {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      }



      function drawNode(d) {
        // context.moveTo(d.x + radius, d.y);
        // context.arc(d.x, d.y, radius, 0, 2 * Math.PI);


        context.save();
        context.beginPath();
        context.arc(d.x+radius, d.y+radius, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        context.drawImage(d.nodeImg, d.x, d.y, radius*2, radius*2);

        // context.beginPath();
        // context.arc(d.x, d.y, radius+10, 0, Math.PI * 2, true);
        // context.clip();
        // context.closePath();
        context.restore();

        // nodeImg = new Image();
        // nodeImg.src = d.profile_image_url;
        // nodeImg.onload = function() {
        //     console.log("loaded" + d.profile_image_url);
        //     context.save();
        //     context.beginPath();
        //     context.arc(radius, radius, radius, 0, Math.PI * 2, true);
        //     context.closePath();
        //     context.clip();

        //     context.drawImage(nodeImg, 0, 0, radius*2, radius);

        //     context.beginPath();
        //     context.arc(d.x, d.y, radius, 0, Math.PI * 2, true);
        //     context.clip();
        //     context.closePath();
        //     context.restore();
        // };
      }



    });
  }; //chart




  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  setupVis = function(data) {


  };

  loadImages = function(graph) {
    graph.nodes.forEach(function (d) {
      d.nodeImg = new Image();
      d.nodeImg.src = d.profile_image_url;
      d.nodeImgData = null;
      d.nodeImg.onload = function() {
        console.log("Loaded image" + d.profile_image_url);
        d.nodeImgData = this;
      }
    });
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    var STEPS = 9;
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showFillerTitle;
    activateFunctions[2] = showNodes;
    activateFunctions[3] = showFillerTitle;
    activateFunctions[4] = showFillerTitle;
    activateFunctions[5] = showFillerTitle;
    activateFunctions[6] = showFillerTitle;
    activateFunctions[7] = showFillerTitle;
    activateFunctions[8] = showFillerTitle;
    // activateFunctions[2] = showGrid;
    // activateFunctions[3] = highlightGrid;
    // activateFunctions[4] = showBar;
    // activateFunctions[5] = showHistPart;
    // activateFunctions[6] = showHistAll;
    // activateFunctions[7] = showCough;
    // activateFunctions[8] = showHistAll;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < STEPS; i++) {
      updateFunctions[i] = function() {};
    }
    // updateFunctions[7] = updateCough;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    simulation.stop();
    context.clearRect(0, 0, width, height);
    context.save();

    context.font = "30px Arial";
    context.fillText("ieeevis Influentials",10,50);

    context.restore();
  }

  /**
   * showFillerTitle - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showFillerTitle() {
    simulation.stop();
    context.clearRect(0, 0, width, height);
    context.save();

    context.font = "30px Arial";
    context.fillText("Too",10,50);

    context.restore();
  }


  function showNodes () {
    simulation.force("link", function () {});
    simulation.restart();
  }

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// load data and display
d3.json("data/ieeevisNetwork.json", display);

