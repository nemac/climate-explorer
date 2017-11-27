(function($) {
    Chart.defaults.scale.ticks.autoSkipPadding = 80;

    if (typeof(widget) !== 'undefined'){
        throw new Error("jQuery Widget not found.");

    }
    if (document.getElementById("myChart") === 'null'){
        throw new Error("Charting element not found.");
    }

    else{
    $.widget("nemac.tidalstationwidget", {
        options: {
            station:''
        },
        data: {},
        _create: function (options) {
            var defaults = {
              data_url: 'tidal_data.json'
            };

            this.options = Object.assign(defaults, options);

            var self = this;
            $.getJSON(this.options.data_url, function (json) {
              self.data = json;
            });
        },
        update: function (options) {
            this.options = Object.assign(this.options, options);

            // transform data from object to array
            var data_hist = [];
            for (var i = 1950; i <= 2016; i++) {
                try {
                    data_hist.push(this.data.hist[this.options.station][i]);
                }
                catch (e) {
                    if (e instanceof TypeError) {
                        data_hist.push(0);
                    }
                }
            }

            // turn projected data values into an array
            var labels = [];
            var data_rcp45 = [];
            var data_rcp85 = [];
            for (var i = 1950; i <= 2100; i++) {
              // build an array of labels
              labels.push(i.toString());

              // prepend 0s to historical range
              if (i <= 2000) {
                data_rcp45.push(0);
                data_rcp85.push(0);
              } else {
                data_rcp45.push(this.data.rcp45[this.options.station][i]);
                data_rcp85.push(this.data.rcp85[this.options.station][i]);
              }
            }

            // compose chart
            var ctx = this.element[0].getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            data: data_hist,
                            label: "Historic",
                            backgroundColor: "#aaaaaa",
                            borderColor: "#aaaaaa",
                            fill: false
                        },
                        {
                            data: data_rcp45,
                            label: "RCP 4.5",
                            backgroundColor: "#0058cf",
                            borderColor: "#0058cf",
                            fill: false
                        }, {
                            data: data_rcp85,
                            label: "RCP 8.5",
                            backgroundColor: "#f5442d",
                            borderColor: "#f5442d",
                            fill: false
                        }
                    ]
                },
                options: {
                    events: [],
                    tooltipTemplate: "<%=datasetLabel%> : <%= value %>",
                    legend: {
                        display: true,
                        labels: {
                            fontColor: 'black'
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                max: 365,
                                stepSize: 100,
                                maxTicksLimit: 20
                            }
                        }]
                    }
                }
            });

        }
    });
}})(jQuery);
