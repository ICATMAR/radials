<template>
  <!-- Loading bar -->
  <Transition>
    <div id="progress-container" v-show="progress != 100">
      <span id="progress-text">{{ progress }} %</span>
      <div id="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </Transition>
  <!-- High charts -->
  <highcharts id="chart" :options="chartOptions"></highcharts>

</template>

<script>
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
import { Transition } from 'vue';
// https://www.highcharts.com/demo/highcharts/combo-multi-axes

//import axisData from "./RadialChartAxis.js";

export default {
  props: {
    antennaID: {
      type: String,
      required: true
    },
    axisData: {
      type: Object,
      required: true,
    }
  },
  mounted() {
    this.getRadarData();
  },
  data() {
    return {
      // Progress bar
      progress: 0,
      // Highcharts
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
        yAxis: [{ // Default yAxis
          title: {
            text: this.axisData[0].name,
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          labels: {
            format: this.axisData[0].label,
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          opposite: true
        },
          // { // Secondary yAxis
          //   gridLineWidth: 0,
          //   title: {
          //     text: 'Flagged points',
          //     style: {
          //       color: Highcharts.getOptions().colors[2]
          //     }
          //   },
          //   labels: {
          //     format: '{value} flagged points',
          //     style: {
          //       color: Highcharts.getOptions().colors[2]
          //     }
          //   }

          // }, { // Tertiary yAxis
          //   gridLineWidth: 0,
          //   title: {
          //     text: 'Max. velocity',
          //     style: {
          //       color: Highcharts.getOptions().colors[1]
          //     }
          //   },
          //   labels: {
          //     format: '{value} cm/s',
          //     style: {
          //       color: Highcharts.getOptions().colors[1]
          //     }
          //   },
          //   opposite: true
          // }
        ],
        tooltip: {
          shared: true,
          xDateFormat: '%Y-%m-%d %Hh',
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
          name: this.axisData[0].name,
          type: this.axisData[0].type,
          yAxis: 0,
          data: [],
          tooltip: {
            valueSuffix: ' ' + this.axisData[0].units,
          }
        },
          // Secondary
          // {
          //   name: 'Flagged points',
          //   type: 'spline',
          //   yAxis: 1,
          //   data: [],
          //   marker: {
          //     enabled: false
          //   },
          //   dashStyle: 'shortdot',
          //   tooltip: {
          //     valueSuffix: ' points'
          //   }

          // },
          // // Tertiary
          // {
          //   name: 'Max. velocity',
          //   type: 'spline',
          //   yAxis: 2,
          //   data: [],
          //   tooltip: {
          //     valueSuffix: ' cm/s'
          //   }
          // }
        ],
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
              }, 
              // {
              //   labels: {
              //     align: 'left',
              //     x: 0,
              //     y: -6
              //   },
              //   showLastLabel: false
              // }, {
              //   visible: false
              // }
            ]
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
        //console.log('Loaded timestamps of ' + this.antennaID + ': ' + tmstsLoaded + ' of ' + totalTmstsToLoad);
        this.progress = parseInt((tmstsLoaded / totalTmstsToLoad) * 100);
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
        //this.chartOptions.series[1].name = 'Flagged points';
        //this.chartOptions.series[2].name = 'Max Velocity';

        this.chartOptions.series[0].data = dataSeries1;
        //this.chartOptions.series[1].data = dataSeries2;
        //this.chartOptions.series[2].data = dataSeries3;
        //console.log(res);
      }).catch(e => { debugger; });
    },



    // PUBLIC
    load24hMore() {
      if (this.currentHoursBackInTime == undefined) {
        this.currentHoursBackInTime = 24;
      }

      let timestamps = [];
      // 24 back in time
      let date = new Date();
      let dateISO = date.toISOString();
      date.setUTCHours(date.getUTCHours() - this.currentHoursBackInTime); // One hour less
      this.currentHoursBackInTime += 24;
      // Back in time
      for (let i = 0; i < 24; i++) {
        if (i > 0)
          date.setUTCHours(date.getUTCHours() - 1); // One hour less
        dateISO = date.toISOString();
        dateISO = dateISO.substring(0, 14) + '00:00.000Z'; // Hourly
        timestamps.push(dateISO);
      }

      // Call Datamanager tp get antenna data (DataManager > FileManager > DataManager HFRadar class > Return antenna)
      this.progress = 0;
      window.DataManager.getAntennaFiles(this.antennaID, timestamps, (tmstsLoaded, totalTmstsToLoad) => {
        //console.log('Loaded timestamps of ' + this.antennaID + ': ' + tmstsLoaded + ' of ' + totalTmstsToLoad);
        this.progress = parseInt((tmstsLoaded / totalTmstsToLoad) * 100);
      }).then(res => {
        let dataSeries1 = [];
        let dataSeries2 = [];
        let dataSeries3 = [];
        for (let i = 0; i < timestamps.length; i++) {
          // Assign timestamp
          let tmst = timestamps[i];
          let tmstNum = new Date(tmst).getTime();
          // Get radar object from DataManager
          let radarData = window.DataManager.HFRadars[this.antennaID];
          let points = radarData.data[tmst];

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

        this.chartOptions.series[0].data = [...this.chartOptions.series[0].data, ...dataSeries1];
        //this.chartOptions.series[1].data = [...this.chartOptions.series[1].data, ...dataSeries2];
        //this.chartOptions.series[2].data = [...this.chartOptions.series[2].data, ...dataSeries3];
      });

    }
  },
};
</script>

<style scoped>
#chart {
  height: 200px;
}

#progress-container {
  position: relative;
  display: flex;
  justify-content: center;
  background-color: var(--darkBlue);
  border-radius: 10px;
}

#progress-bar {
  width: 100%;
  height: 100%;
  background: var(--lightBlue);
  position: absolute;
  border-radius: 5px;
  opacity: 0.5;
}

#progress-text {
  z-index: 2;
  color: white;
  text-shadow: 0 0 4px black;
}

/* Add any styles here */
</style>