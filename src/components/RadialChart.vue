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

//import axesData from "./RadialChartAxis.js";

export default {
  props: {
    antennaID: {
      type: String,
      required: true
    },
    axesData: {
      type: Object,
      required: true,
    }
  },
  mounted() {
    // Add input axes to currentAxes
    for (let i = 0; i < this.axesData.length; i++) {
      this.currentAxes.push(this.axesData[i]);
    }
    // Load 24 first hours
    this.load24hMore();
  },
  data() {
    return {
      // Progress bar
      progress: 0,
      // Hours in timeline
      currentHoursBackInTime: 0,
      // Requested timestamps
      reqTimestamps: [],
      // Current axis
      currentAxes: [],
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
        yAxis: [
          //   { // Default yAxis
          //   title: {
          //     text: this.axesData[0].name,
          //     style: {
          //       color: Highcharts.getOptions().colors[0]
          //     }
          //   },
          //   labels: {
          //     format: this.axesData[0].label,
          //     style: {
          //       color: Highcharts.getOptions().colors[0]
          //     }
          //   },
          //   opposite: true
          // },
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
          y: 0,
          floating: true,
          backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || // theme
            'rgba(255,255,255,0.25)'
        },
        series: [
          //   {
          //   // Primary
          //   name: this.axesData[0].name,
          //   type: this.axesData[0].type,
          //   yAxis: 0,
          //   data: [],
          //   tooltip: {
          //     valueSuffix: ' ' + this.axesData[0].units,
          //   }
          // },
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
              yAxis: [
                //   {
                //   labels: {
                //     align: 'right',
                //     x: 0,
                //     y: -6
                //   },
                //   showLastLabel: false
                // },
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

    // PUBLIC
    addAxis(axis, option) {

      // Store axis config in case we want to load more data later
      axis.selOption = option || axis.options[0];
      this.currentAxes.push(axis);

      let data = [];

      // Create data
      // Iterate timestamps
      for (let i = 0; i < this.reqTimestamps.length; i++) {
        // Get data value
        let tmst = this.reqTimestamps[i];
        let radarData = window.DataManager.HFRadars[this.antennaID];
        if (radarData == undefined) { debugger; }
        // Calculate value and store
        let points = radarData.data[tmst];
        let value = axis.calculate(points, option);
        data.push([new Date(tmst).getTime(), value]);
      }

      // Integrate axis in highcharts data structure
      let currentAxisIndex = this.currentAxes.length - 1;
      // yAxis
      this.chartOptions.yAxis[currentAxisIndex] = {
        title: {
          text: axis.name,
          style: {
            color: Highcharts.getOptions().colors[this.currentAxes.length - 1],
          }
        },
        labels: {
          format: axis.label,
          style: {
            color: Highcharts.getOptions().colors[this.currentAxes.length - 1],
          }
        }
      };
      // series
      this.chartOptions.series[currentAxisIndex] = {
        name: axis.name,
        type: axis.type,
        data: data,
        marker: { enabled: false },
        //dashStyle: 'shortdot',
        tooltip: {
          valueSuffix: ' ' + axis.units,
        }
      };
      // Responsive?
    },




    // Load 24 files more
    load24hMore() {

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
      this.reqTimestamps = this.reqTimestamps.concat(timestamps);

      // Call Datamanager tp get antenna data (DataManager > FileManager > DataManager HFRadar class > Return antenna)
      this.progress = 0;
      return window.DataManager.getAntennaFiles(this.antennaID, timestamps, (tmstsLoaded, totalTmstsToLoad) => {
        //console.log('Loaded timestamps of ' + this.antennaID + ': ' + tmstsLoaded + ' of ' + totalTmstsToLoad);
        this.progress = parseInt((tmstsLoaded / totalTmstsToLoad) * 100);
      }).then(res => {
        let hasData = false;
        for (let i = 0; i < res.length; i++) {
          if (res[i].status == 'fulfilled') {
            hasData = true;
          }
        }
        return hasData;
      }).then(hasData => {
        if (hasData == false) {
          // If no data, show the option to load more?
          debugger;
        } else {
          // Refill the charts with the currentAxes
          // Reset currentAxes as addAxis refills array
          let tempAxes = this.currentAxes;
          this.currentAxes = [];
          for (let i = 0; i < tempAxes.length; i++) {
            this.addAxis(tempAxes[i], tempAxes[i].selOption);
          }
        }
      }).catch(e => { throw e });

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