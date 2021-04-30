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
      scale: 'full',
      layout: {
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
          tick0: 1950,
          dtick: 10,
          ticks: "outside",
          linecolor: 'rgb(0,0,0)',
          side: "bottom",
          range: [1950, 2100]
        },
        yaxis: {
          tickmode: "linear",
          tick0: 0,
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
          },
          range: [0, 365]
        },
        legend: {
          "orientation": "h"
        },
        hovermode: 'x unified',
        hoverdistance: 50,
        autosize: true,
        margin: {
          l: 50,
          t: 5,
          r: 5,
          b: 5
        }
      }
    },
    scales: {
      full: {xrange: [1950, 2100], yrange: [0, 365], y_dtick: 75},
      historical: {xrange: [1950, 2020], yrange: [0, 365], y_dtick: 5}
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
        this.options.scale = 'full';
        this.scales = {
          full: {xrange: [1950, 2100], yrange: [0, 365], y_dtick: 75},
          historical: {xrange: [1950, 2020], yrange: [0, 365], y_dtick: 5}
        };

        this.options.layout.xaxis.range = this.scales[this.options.scale].xrange;
        this.options.layout.yaxis.range = this.scales[this.options.scale].yrange;
        this.options.layout.yaxis.dtick = this.scales[this.options.scale].y_dtick;

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

      this.options.layout.xaxis.range = this.scales[this.options.scale].xrange;
      this.options.layout.yaxis.range = this.scales[this.options.scale].yrange;
      this.options.layout.yaxis.dtick = this.scales[this.options.scale].y_dtick;

      this._update();

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
            data_hist.push(flood_data);
          }
        }
        catch (e) {
          if (e instanceof TypeError) {
            data_hist.push(0);
          }
        }
      }

      this.scales.historical.yrange[1] = Math.max(...data_hist) * 2;

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

      let tidalChart = document.getElementById('tidal-chart');

      if(!tidalChart || tidalChart === null) {
        return;
      }

      let chartDiv = document.getElementById("chart");

      if(!chartDiv || chartDiv === null) {
        chartDiv = document.createElement("div");
        chartDiv.id = "chart";
        tidalChart.appendChild(chartDiv);
      }

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
    
      // let layout = {
      //     yaxis2: {
      //       type: 'linear',
      //       matches: 'y',
      //       overlaying: 'y',
      //       showline: false,
      //       showgrid: false,
      //       showticklabels: false,
      //       nticks: 0
      //     },
      //     xaxis: {
      //       tickmode: "linear",
      //       tick0: 1950,
      //       dtick: 10,
      //       ticks: "outside",
      //       linecolor: 'rgb(0,0,0)',
      //       side: "bottom",
      //       range: [1950, 2020]
      //     },
      //     yaxis: {
      //       tickmode: "linear",
      //       tick0: 0,
      //       dtick: 75,
      //       ticks: "outside",
      //       side: "left",
      //       linecolor: 'rgb(0,0,0)',
      //       title: {
      //         text: 'Annual Days with High-Tide Flooding',
      //         font: {
      //           size: 12,
      //           color: '#494949'
      //         }
      //       },
      //       range: [0, 365]
      //     },
      //     legend: {
      //       "orientation": "h"
      //     },
      //     hovermode: 'x unified',
      //     plotly_layout_defaults: {
      //       hoverdistance: 50,
      //       autosize: true,
      //       margin: {
      //         l: 50,
      //         t: 12,
      //         r: 12,
      //         b: 30
      //       }
      //     }
      // }
    
      let config = {
          responsive: true,
          displaylogo: false, 
          modeBarButtonsToRemove: ['toImage', 'lasso2d', 'select2d','resetScale2d']
      }
    
      Plotly.react(chartDiv, data, this.options.layout, config);

    }
  });
})(jQuery);
