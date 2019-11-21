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
          data_hist.push(this.data.floods_historical[String(this.options.station)][i]);
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

      // compose chart
      if (this.chart !== undefined) {
        this.chart.destroy()
      }
      if (this.nodes.chart === undefined) {
        this.nodes.chart = $('<canvas></canvas>').uniqueId().appendTo(this.element);
      }
      // White background for downloaded images.
      Chart.plugins.register({
        beforeDraw: function(chartInstance) {
          var ctx = chartInstance.chart.ctx;
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
        }
      });

      this.chart = new Chart(this.nodes.chart, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              data: data_hist,
              label: "Historical",
              backgroundColor: "#d6d6d6",
              borderColor: "#aaaaaa",
              borderWidth: 3,
              fill: true
            },
            {
              data: data_rcp45,
              label: "Lower Emissions",
              backgroundColor: "#99BCEC",
              borderColor: "#0058cf",
              borderWidth: 3,
              fill: true,
              type: 'line'
            }, {
              data: data_rcp85,
              label: "Higher Emissions",
              backgroundColor: "#fbb4ab",
              borderColor: "#f5442d",
              borderWidth: 3,
              fill: true,
              type: 'line'
            }
          ]
        },
        options: {
          elements: {point: {radius: 0}},
          responsive: this.options.responsive,
          maintainAspectRatio: false,
          // events: [],
          tooltips: {
            mode: 'index',
            intersect: false,
            itemSort: function(a, b) {
              return b.datasetIndex - a.datasetIndex
            },
            callbacks: {
              label: function (tooltipItem, data) {
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + (Math.round(value * 10) / 10) + ' days';
              }
            }
          },
          hover: {
            mode: 'index',
            intersect: false
          },
          legend: {
            display: true,
            labels: {
              fontColor: 'black'
            }
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                fontSize: 16,
                labelString: 'Annual Days with High-Tide Flooding',
                display: true
              },
              ticks: {
                beginAtZero: true,
                fontSize: 14,
                max: this.scales[this.options.scale].y_max,
                stepSize: this.scales[this.options.scale].y_step,
                maxTicksLimit: 20
              }
            }],
            xAxes: [{
              scaleLabel: {
                fontSize: 16,
                labelString: 'Year',
                display: true,
                autoSkipPadding: 80
              },
              ticks: {
                autoskip: true,
                autoSkipPadding: 60,
                fontSize: 16,
                min: 1950,
                max: this.scales[this.options.scale].x_max,
              }
            }]
          }
        }
      });
    }
  });
})(jQuery);
