(function(exports) {

  var wf = exports.wf || (exports.wf = {});

  var graph = wf.graph = function(selector) {
    var graph = {};

    var options = {
      "metric": "total",
      "chartWidth": 200,
      "chartHeight": 150
    }
    
    var root = d3.select(selector),
        svg = root.append("svg")
          .attr("height", options.chartHeight * 60),
        columns = svg.append('g')
          .attr("class", "columns"),
        x = d3.scale.linear()
          .domain([0, 24])
          .range([0, options.chartWidth]),
        y = d3.scale.linear()
          .range([0, options.chartHeight])
        yScales = {};

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

        var col = columns.append("g")
          .attr("class", "column " + type);

        yScales[col.attr("class")] = d3.scale.linear()
          .domain([
            d3.min(byHour, function(d) {
              return d3.min(d.values, function(dd) {
                return +dd.values[options.metric];
              })
            }),
            d3.max(byHour, function(d) {
              return d3.max(d.values, function(dd) {
                return +dd.values[options.metric];
              })
            })
          ])
          .range([0, options.chartHeight])

        console.log("col", col, col.yScale);


        col.selectAll("g")
          .data(byHour)
        .enter().append("g")
          .attr("class", function(d) {return "histogram " + d.key})
          .each(function(d) {
            yScales[d3.select(this).attr("class")] = d3.scale.linear()
              .domain(
                d3.extent(d.values, function(dd) {
                    return +dd.values[options.metric];
                })
              )
              .range([0, options.chartHeight])
          });

        console.log("loaded", type);
      });
      return graph;
    };

    graph.draw = function() {
      columns.selectAll(".column")
        .attr("transform", function(d, i) {return "translate(" + (options.chartWidth * i) + ", 0)"})
      .selectAll(".histogram")
        .attr("transform", function(d, i) { return "translate(0, " + (i * (options.chartHeight + 10)) + ")" })
        .selectAll("rect")
          .data(function(d) {return d.values})
      .enter().append("rect")
        .attr({
          "x": function(d) {return x(d.key)},
          "y": function(d) {
            var yScale = yScales[d3.select(this.parentNode).attr("class")];
            return options.chartHeight - yScale(d.values[options.metric])
          },
          "width": x(1),
          "height": function(d) {
            var yScale = yScales[d3.select(this.parentNode).attr("class")];
            return yScale(d.values[options.metric])
            }
        })

      console.log("drawn");
      return graph;
    }


    return graph;
  };


})(this);
