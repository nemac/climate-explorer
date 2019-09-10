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
      data_url: 'tidal_data.json'
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
    _update: function () {
      if (!this.options.station){
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
        labels.push(i.toString());

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
      this.chart = new Chart(this.nodes.chart, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              data: data_hist,
              label: "Historic",
              backgroundColor: "#aaaaaa",
              borderColor: "#aaaaaa",
              borderWidth: 5,
              fill: false
            },
            {
              data: data_rcp45,
              label: "Lower Emissions",
              backgroundColor: "#0058cf",
              borderColor: "#0058cf",
              borderWidth: 5,
              fill: false
            }, {
              data: data_rcp85,
              label: "Higher Emissions",
              backgroundColor: "#f5442d",
              borderColor: "#f5442d",
              borderWidth: 5,
              fill: false
            }
          ]
        },
        options: {
          responsive: this.options.responsive,
          maintainAspectRatio: false,
          // events: [],
          tooltips: {
            mode: 'index',
            callbacks: {
              label: function (tooltipItem, data) {
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + (Math.round(value * 10) / 10) + ' days';
              }
            }
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
                fontSize: 13,
                labelString: 'Annual Days with High-tide Flooding',
                display: true
              },
              ticks: {
                beginAtZero: true,
                max: 365,
                stepSize: 100,
                maxTicksLimit: 20
              }
            }],
            xAxes: [{
              scaleLabel: {
                fontSize: 13,
                labelString: 'Year',
                display: true,
                autoSkipPadding: 80
              }
            }]
          }
        }
      });
    }
  });
})(jQuery);
