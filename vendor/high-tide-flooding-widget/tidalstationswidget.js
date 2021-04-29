'use strict';
(function ($) {

  if (typeof($.widget) === 'undefined') {
    console.error("jQuery Widget not found.");
    return
  }
  $.widget("nemac.tidalstationwidget", {
    options: {
      responsive: true,
      station: '',
      data_url: 'tidal_data.json',
      scale: 'full'
    },
    scales: {
      full: {x_max: 2100, y_max: 365, y_step: 75},
      historical: {x_max: 2020, y_max: 50, y_step: 10}
    },
    data: {},

    _create: function (options) {
      this.nodes = {};
      $.getJSON(this.options.data_url, function (json) {
        this.data = json;
        this._update(options);
      }.bind(this));
    },
    _destroy: function () {
      if (this.chart !== undefined) {
        this.chart.destroy()
      }
    },
    _setOption: function (key, value) {
      this._super(key, value);
      if (key === 'station') {
        this._update()
      }
    },
    zoomToggle: function () {
      if (this.options.scale === 'historical') {
        this.options.scale = 'full';
      }
      else {
        this.options.scale = 'historical';
      }


      this.chart.options.scales.xAxes[0].ticks.max = this.scales[this.options.scale].x_max;
      this.chart.options.scales.yAxes[0].ticks.max = this.scales[this.options.scale].y_max;
      this.chart.options.scales.yAxes[0].ticks.stepSize = this.scales[this.options.scale].y_step;
      this.chart.update();

    },

    _update: function () {
      if (!this.options.station) {
        return
      }
      // transform data from object to array
      let data_hist = [];

      for (let i = 1950; i <= 2016; i++) {
  
        try {
          let flood_data = this.data.floods_historical[String(this.options.station)][i];
          
          if(typeof flood_data === 'undefined') {
            data_hist.push(0);
          } else {
            data_hist.push(this.data.floods_historical[String(this.options.station)][i]);
          }
        }
        catch (e) {
          if (e instanceof TypeError) {
            data_hist.push(0);
          }
        }
      }

      // turn projected data values into an array
      let labels = [];
      let data_rcp45 = [];
      let data_rcp85 = [];
      
      for (let i = 1950; i <= 2100; i++) {
        // build an array of labels
        labels.push(i);

        // prepend 0s to historical range
        if (i <= 2000) {
          data_rcp45.push(0);
          data_rcp85.push(0);
        } else {
          data_rcp45.push(this.data.int_low[String(this.options.station)][i]);
          data_rcp85.push(this.data.int[String(this.options.station)][i]);
        }
      }

      const tidalChart = document.getElementById('tidal-chart');

      if(!tidalChart) {
        return;
      }

      const chartDiv = document.createElement("div");
      chartDiv.id = "chart";
      chartDiv.style = "70vh";

      tidalChart.appendChild(chartDiv);

      let chart_historic = {
        type: "bar",
        x: labels,
        y: data_hist,
        name: "Historical",
        fill: "tonexty",
        yaxis: "y2",
        marker: {
          color: "rgba(170,170,170, 0.5)",
          line: {
            color: 'rgb(119,119,119)',
            width: 1.5
          }
        },
        hovertemplate: "Historical: <b>%{y}</b>",
        hoverlabel: {
          namelength: 0
        }
      }

      let chart_rcp45 = {
        x: labels,
        y: data_rcp45,
        mode: "lines",
        name: "Lower Emissions",
        fill: "tonexty",
        fillcolor: 'rgba(25,104,211, 0.5)',
        line: {
            color: 'rgb(0,88,207)',
            width: 2
        },
        hovertemplate: "Lower Emissions: <b>%{y}</b>",
        hoverlabel: {
          namelength: 0
        }
      }

      let chart_rcp85 = {
        x: labels,
        y: data_rcp85,
        mode: "lines",
        name: "Higher Emissions",
        fill: "tonexty",
        fillcolor: 'rgba(246, 86, 66, 0.5)',
        line: {
            color: 'rgb(245,68,45)',
            width: 2
        },
        hovertemplate: "Higher Emissions: <b>%{y}</b>",
        hoverlabel: {
          namelength: 0
        }
      }
      let data = [chart_historic, chart_rcp45, chart_rcp85]
    
      let layout = {
          yaxis2: {
            type: 'linear',
            matches: 'y',
            overlaying: 'y',
            showline: false,
            showgrid: false,
            showticklabels: false,
            nticks: 0
          },
          xaxis: {
            tickmode: "linear",
            dtick: 10,
            ticks: "outside",
            linecolor: 'rgb(0,0,0)'
          },
          yaxis: {
            tickmode: "linear",
            dtick: 75,
            ticks: "outside",
            side: "left",
            linecolor: 'rgb(0,0,0)',
            title: {
              text: 'Annual Days with High-Tide Flooding',
              font: {
                size: 12,
                color: '#494949'
              }
            }
          },
          legend: {
            "orientation": "h"
          },
          hovermode: 'x unified',
          
      }
    
      let config = {
          responsive: true,
          displaylogo: false, 
          modeBarButtonsToRemove: ['toImage', 'lasso2d', 'select2d','resetScale2d']
      }
    
      Plotly.react(chartDiv, data, layout, config);

    }
  });
})(jQuery);
