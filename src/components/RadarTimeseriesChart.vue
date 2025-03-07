<template>
  <!-- Loading bar -->
  <Transition>
    <div id="progress-container" v-show="progress != 100">
      <span id="progress-text">{{ progress }} %</span>
      <div id="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </Transition>

  <div v-show="showNoData" id="no-data-message">
    <span>{{ $t('No data for the last 24 hours requested') }}</span>
    <button @click="showNoData = false">Close</button>
  </div>

  <!-- High charts -->
  <highcharts id="chart" :options="chartOptions"></highcharts>

</template>

<script>
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
import { Transition } from 'vue';
// https://www.highcharts.com/demo/highcharts/combo-multi-axes
// In case of wanting a xAxis navigator
// https://github.com/highcharts/highcharts-vue#implementing-stockchart-mapchart-and-ganttchart


export default {
  props: {
    antennaID: {
      type: String,
      required: true
    },
    radarVarsData: {
      type: Object,
      required: true,
    }
  },
  mounted() {
    // Add input radar var to currentRadarVars
    for (let i = 0; i < this.radarVarsData.length; i++) {
      this.currentRadarVars.push(this.radarVarsData[i]);
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
      // Current radar variable
      currentRadarVars: [],
      // Num points should share the same axis
      numPointsAxisIndex: undefined,
      // When 24h contained no data
      showNoData: false,
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
          //     text: this.radarVarsData[0].name,
          //     style: {
          //       color: Highcharts.getOptions().colors[0]
          //     }
          //   },
          //   labels: {
          //     format: this.radarVarsData[0].label,
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
        plotOptions: {
          dataGrouping: {
            enabled: true
          },
          column: {
            pointWidth: 10,
          }
        },
        legend: {
          enabled: false
        },
        // legend: {
        //   layout: 'vertical',
        //   align: 'left',
        //   x: 80,
        //   verticalAlign: 'top',
        //   y: 0,
        //   floating: true,
        //   backgroundColor:
        //     Highcharts.defaultOptions.legend.backgroundColor || // theme
        //     'rgba(255,255,255,0.25)'
        // },
        series: [
          //   {
          //   // Primary
          //   name: this.radarVarsData[0].name,
          //   type: this.radarVarsData[0].type,
          //   yAxis: 0,
          //   data: [],
          //   tooltip: {
          //     valueSuffix: ' ' + this.radarVarsData[0].units,
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
    addRadarVar(radarVar, option) {

      // Store radarVar config in case we want to load more data later
      radarVar.selOption = option || radarVar.options[0];
      this.currentRadarVars.push(radarVar);

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
        let value = radarVar.calculate(points, option);
        if (value % 1 !== 0) {
          value = parseFloat(value.toFixed(1));
        }
        data.push([new Date(tmst).getTime(), value]);
      }

      // Integrate radarVar in highcharts data structure
      let currentAxisIndex = this.currentRadarVars.length - 1;
      // YAXIS - yAxis
      this.chartOptions.yAxis[currentAxisIndex] = {
        visible: currentAxisIndex == 0,
        title: {
          text: radarVar.name,
          style: {
            color: Highcharts.getOptions().colors[this.currentRadarVars.length - 1],
          }
        },
        labels: {
          format: radarVar.label,
          style: {
            color: Highcharts.getOptions().colors[this.currentRadarVars.length - 1],
          },
          visible: false,
        }
      };
      // SERIES - series
      let yAxisRangeIndex = currentAxisIndex;
      // yAxis common for Nº points
      let isPointsAxis = radarVar.name.includes('Nº') && radarVar.name.includes('points');
      // First definition
      if (isPointsAxis && this.numPointsAxisIndex == undefined) {
        this.numPointsAxisIndex = currentAxisIndex;
      }
      // yAxis common for same series with different options
      // Find if any series has the same name
      let similarSeries = this.currentRadarVars.filter(ax => ax.name == radarVar.name);
      if (similarSeries.length > 1) {
        yAxisRangeIndex = this.currentRadarVars.findIndex(ax => ax.name == radarVar.name);
      }

      this.chartOptions.series[currentAxisIndex] = ({
        name: radarVar.name + ' (' + radarVar.selOption + ')',
        type: radarVar.type,
        yAxis: isPointsAxis ? this.numPointsAxisIndex : yAxisRangeIndex,
        data: data,
        marker: { enabled: false },
        //dashStyle: 'shortdot',
        tooltip: {
          valueSuffix: ' ' + radarVar.units,
        },
        visible: true,
        // HACK: missing functions for series when using chart options
        setState: function (state) {
          if (state == 'inactive') {
            this.opacity = 0.5;
            this.lineWidth = 1;
          } else if (state == 'hover') {
            this.opacity = 1.0;
            this.lineWidth = 4;
          } else if (state == 'normal') {
            this.opacity = 1.0;
            this.lineWidth = 2;
          }
        },

      });


      // RESPONSIVE - responsive
      this.chartOptions.responsive.rules[0].chartOptions.yAxis[currentAxisIndex] = {
        showLastLabel: false,
        title: {
          text: null
        },
        labels: {
          format: null
        }
      }


      // HACK: fix discontinuity in lines (issue #3)
      this.chartOptions.series[currentAxisIndex].visible = !this.chartOptions.series[currentAxisIndex].visible;
      this.$nextTick(() => {
        this.chartOptions.series[currentAxisIndex].visible = !this.chartOptions.series[currentAxisIndex].visible;
      })
    },







    // Load 24 files more
    load24hMore() {

      this.showNoData = false;

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
          this.showNoData = true;
          return;
        } else {
          // Refill the charts with the currentRadarVars
          // Reset currentRadarVars as addAxis refills array
          let tempRadarVar = this.currentRadarVars;
          this.currentRadarVars = [];
          for (let i = 0; i < tempRadarVar.length; i++) {
            this.addRadarVar(tempRadarVar[i], tempRadarVar[i].selOption);
          }
        }
      }).catch(e => { throw e });

    },


    // Hide / Show variables
    setVariableVisible(varIndex, isVisible) {
      this.chartOptions.series[varIndex].visible = isVisible;
    },


    // Hover
    // https://www.highcharts.com/forum/viewtopic.php?t=49254
    // https://jsfiddle.net/BlackLabel/abphd5un/
    highlightVariable(index) {
      // Make every series inactive
      this.chartOptions.series.forEach(series => {
        series.setState('inactive');
      })
      // Highlight chosen series
      this.chartOptions.series[index].setState('hover');
    },
    // Mouse leave
    resetVariableHighlights() {
      this.chartOptions.series.forEach(series => {
        series.setState('normal');
      })
    }



  },
};
</script>

<style scoped>
#chart {
  height: 200px;
}

#progress-container {
  position: absolute;
  width: 50%;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

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

#no-data-message {
  position: absolute;
  width: 50%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: orange;
  border-radius: 20px;
}
</style>