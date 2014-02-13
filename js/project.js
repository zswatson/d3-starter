(function(exports) {

  var wf = exports.wf || (exports.wf = {});

  var graph = wf.graph = function(selector) {
    var graph = {};

    var options = {
      "metric": "transactions",
      "chartWidth": 200,
      "chartHeight": 150
    }
    
    var root = d3.select(selector),
        svg = root.append("svg"),
        columns = svg.append('g')
          .attr("class", "columns"),
        y = d3.scale.linear()
          .range([0, options.chartHeight]);

    graph.load = function(type, path) {
      d3.csv(path, function(data) {
        var byDay = d3.nest()
            .key(function(d) {return d.mcc_cat_desc})
            .entries(data)

        var byHour = d3.nest()
            .key(function(d) {return d.mcc_cat_desc})
            .key(function(d) {return d.hour})
            .rollup(function(h) {return {
              transactions: d3.sum(h, function(d) {return +d.transactions}), 
              total: d3.sum(h, function(d) {return +d.total})
              }})
            .entries(data)

        console.log("data", byDay, byHour)
        y.domain(d3.extent(data, function(d) {return d[options.metric]}));

        var col = columns.append("g")
          .attr("class", type);

        col.selectAll("g")
          .data(byDay)
        .enter().append("g")
          .attr("class", function(d) {return "histogram " + d.key})

        console.log("loaded", type);
      });
      return graph;
    };

    graph.draw = function() {
      svg.selectAll(".histogram")
        .attr("transform", function(d, i) { return "translate(0, " + (i * options.chartHeight + 10) + ")" })
        .selectAll("rect")
          .data(function(d) {return d.values})
      .enter().append("rect")
        .attr({
          "x": function(d) {return x(d.hour)},
          "y": function(d) {return options.chartHeight - y(d[options.metric])},
          "width": 1,
          "height": function(d) {return y(d[options.metric])}
        })

      console.log("drawn");
      return graph;
    }


    return graph;
  };


})(this);
