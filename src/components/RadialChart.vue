<template>
  <highcharts id="chart" :options="chartOptions"></highcharts>
</template>

<script>
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
// https://www.highcharts.com/demo/highcharts/combo-multi-axes



export default {
  props: {
    antennaID: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.getRadarData();
  },
  data() {
    return {
      chartOptions: {
        chart: {
          zooming: {
            type: 'xy'
          }
        },
        title: {
          text: this.antennaID,
        },
        subtitle: {
          text: 'Source: icatmar.cat'
        },
        xAxis: [{
          type: 'datetime',
          tickInterval: 3600 * 1000,
          ordinal: false,
          crosshair: true
        }],
        yAxis: [{ // Primary yAxis
          title: {
            text: 'Num. points',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          labels: {
            format: '{value} points',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          opposite: true

        }, { // Secondary yAxis
          gridLineWidth: 0,
          title: {
            text: 'Flagged points',
            style: {
              color: Highcharts.getOptions().colors[2]
            }
          },
          labels: {
            format: '{value} flagged points',
            style: {
              color: Highcharts.getOptions().colors[2]
            }
          }

        }, { // Tertiary yAxis
          gridLineWidth: 0,
          title: {
            text: 'Max. velocity',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          labels: {
            format: '{value} cm/s',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          opposite: true
        }],
        tooltip: {
          shared: true
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          x: 80,
          verticalAlign: 'top',
          y: 55,
          floating: true,
          backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || // theme
            'rgba(255,255,255,0.25)'
        },
        series: [{
          // Primary
          name: 'Num. points',
          type: 'column',
          yAxis: 0,
          data: [],
          tooltip: {
            valueSuffix: ' points'
          }
        }, 
        // Secondary
        {
          name: 'Flagged points',
          type: 'spline',
          yAxis: 1,
          data: [],
          marker: {
            enabled: false
          },
          dashStyle: 'shortdot',
          tooltip: {
            valueSuffix: ' points'
          }

        }, 
        // Tertiary
        {
          name: 'Max. velocity',
          type: 'spline',
          yAxis: 2,
          data: [],
          tooltip: {
            valueSuffix: ' cm/s'
          }
        }],
        responsive: {
          rules: [{
            condition: {
              maxWidth: 500
            },
            chartOptions: {
              legend: {
                floating: false,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                x: 0,
                y: 0
              },
              yAxis: [{
                labels: {
                  align: 'right',
                  x: 0,
                  y: -6
                },
                showLastLabel: false
              }, {
                labels: {
                  align: 'left',
                  x: 0,
                  y: -6
                },
                showLastLabel: false
              }, {
                visible: false
              }]
            }
          }]
        }
      }
    };
  },
  methods: {

    getRadarData() {
      let timestamps = [];
      // Last 24 h?
      let date = new Date();
      let dateISO = date.toISOString();
      dateISO = dateISO.substring(0, 14) + '00:00.000Z'; // Hourly
      timestamps.push(dateISO);
      // Back in time
      date = new Date(dateISO);
      for (let i = 1; i < 24; i++) {
        date.setUTCHours(date.getUTCHours() - 1); // One hour less
        dateISO = date.toISOString();
        dateISO = dateISO.substring(0, 14) + '00:00.000Z'; // Hourly
        timestamps.push(dateISO);
      }

      // Call Datamanager tp get antenna data (DataManager > FileManager > DataManager HFRadar class > Return antenna)
      window.DataManager.getAntennaFiles(this.antennaID, timestamps, (tmstsLoaded, totalTmstsToLoad) => {
        console.log('Loaded timestamps of ' + this.antennaID + ': ' + tmstsLoaded + ' of ' + totalTmstsToLoad);
      }).then(res => {
        // Generate chart data
        let dataSeries1 = [];
        let dataSeries2 = [];
        let dataSeries3 = [];
        for (let i = 0; i < timestamps.length; i++) {
          // Assign timestamp
          let tmst = timestamps[i];
          let tmstNum = new Date(tmst).getTime();
          // this.chartOptions.series[0].data[0].push(new Date(tmst).getTime());
          // this.chartOptions.series[1].data[0].push(new Date(tmst).getTime());7
          // this.chartOptions.series[2].data[0].push(new Date(tmst).getTime());7
          // Get data value
          let radarData = window.DataManager.HFRadars[this.antennaID];
          if (radarData == undefined) { debugger; }
          let points = radarData.data[tmst];
          let header = radarData.headers[tmst];
          let waveHourlyData = radarData.waveHourlyData[tmst];
          let windHourlyData = radarData.windHourlyData[tmst];
          let dataValue = 0
          let dV2 = 0;
          let dV3 = 0;
          if (points != undefined) {
            dataValue = points.length;
            //dV2 = Math.max(...points.map(p => p["SNR (dB)"]));
            dV2 = points.filter(p => 
              p["Q201 (flag)"] != 1 ||
              p["Q202 (flag)"] != 1 ||
              p["Q203 (flag)"] != 1 ||
              p["Q204 (flag)"] != 1 ||
              p["Q205 (flag)"] != 1 ||
              p["Q206 (flag)"] != 1 ||
              p["Q207 (flag)"] != 1).length;
            dV3 = Math.max(...points.map(p => Math.abs(p["Velocity (cm/s)"])));
          }
          dataSeries1.push([tmstNum, dataValue]);
          dataSeries2.push([tmstNum, dV2]);
          dataSeries3.push([tmstNum, dV3]);
        }

        this.chartOptions.series[0].name = 'Num points';
        this.chartOptions.series[1].name = 'Flagged points';
        this.chartOptions.series[2].name = 'Max Velocity';

        this.chartOptions.series[0].data = dataSeries1;
        this.chartOptions.series[1].data = dataSeries2;
        this.chartOptions.series[2].data = dataSeries3;
        //console.log(res);
      }).catch(e => { debugger; });
    }
  },
};
</script>

<style scoped>
#chart {
  height: 200px;
}

/* Add any styles here */
</style>