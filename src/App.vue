<template>
  <TopIcons></TopIcons>
  <!-- Page container -->
  <div class="main-container">
    <!-- Radials title -->
    <div class="title">{{ $t('HF Radars network status') }}</div>
    <div class="table-container" @click="isVariablesTableVisible = false" v-show="isVariablesTableVisible">
      <!-- Close -->
      <button @click="isVariablesTableVisible = false">{{ $t('Close') }}</button>

      <!-- Select radar variable table -->
      <table>
        <tbody>
          <tr class="table-header">
            <th>{{ $t('Name') }}</th>
            <th>{{ $t('Description') }}</th>
            <th>{{ $t('Options') }}</th>
          </tr>
          <tr v-for="(ax, index) in radarVarsData" :class="[index % 2 == 0 ? 'oddRow' : 'evenRow']">
            <td class="variable-name-cell">{{ ax.name }}</td>
            <td>{{ ax.description }}</td>
            <td class="options-td">
              <button @click="() => addRadarVar(ax, opt)" v-for="opt in ax.options">{{ opt }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    <!-- Selected radar variable -->
    <div class="selected-variable-container" v-show="!isVariablesTableVisible">
      <button v-for="(sRV, index) in selectedVars" @click="changeVarVisibility(index)"
        :class="[selectedVarsVisibility[index] ? '' : 'button-inactive']" @mouseenter="onHoverOnVariable(index)"
        @mouseleave="onMouseLeaveVariable()">
        {{ sRV.name }} ({{ sRV.selOption
        }})
        <div class="highchartsLegendCircleColor" :style="{ background: highchartsColors[index] }"></div>
      </button>
    </div>

    <!-- More variables button -->
    <div class="options-container" v-show="!isVariablesTableVisible">
      <button @click="isVariablesTableVisible = true">+ {{ $t('Add other variables') }}</button>
    </div>

    <!-- Load 24h more-->
    <div class="options-container" v-show="!isVariablesTableVisible">
      <button @click="loadPrevious24h">
        <{{ $t('Load 24h more') }}</button>
    </div>


    <!-- Chart - Data visualization  -->
    <div class="graphs-radars-container" v-show="!isVariablesTableVisible">
      <div class="graph-radar-container" v-for="(rr, index) in radars">
        <div class="graph-radar-map-container">
          <div class="graph-container">
            <Chart ref='chart' :antennaID=rr :antennaFullName=radarFullNames[index] :radarVarsData="selectedVars" />
          </div>
          <!-- <div class="map-container">Explore in interactive map</div> -->
        </div>
      </div>
    </div>

    <!-- Bottom images of radars -->
    <div class="imgs-radars-container">
      <!-- <div v-for="rr in radars" class="img-radar-container">
          <div class="img-radar-title ">{{ rr }}</div>
          <div class="filler-img"></div>
        </div> -->
    </div>
  </div>
</template>


<script>
import TopIcons from './components/TopIcons.vue';
import Chart from './components/RadarTimeseriesChart.vue';
import radarVarsDataFile from "./components/RadarVariableDefinitions.js";
import RadarVariableClass from "./components/RadarVariableClass.js";

// Graph colors
import Highcharts from 'highcharts';

export default {
  mounted() {
    for (let i = 0; i < 30; i++) {
      this.highchartsColors[i] = Highcharts.getOptions().colors[i];
    }
  },
  data() {
    return {
      radars: ["CREU", "BEGU", "AREN", "PBCN", "GNST"],
      radarFullNames: ["Cap de Creus", "Cap de Begur", "Port d'Arenys de Mar", "Port de Barcelona", "Port Ginesta"],
      radarVarsData: radarVarsDataFile,
      selectedVars: [radarVarsDataFile[0]],
      selectedVarsVisibility: [true],
      highchartsColors: [],
      isVariablesTableVisible: false,
    }

  },
  methods: {
    loadPrevious24h() {
      for (let i = 0; i < this.radars.length; i++) {
        let chartComp = this.$refs.chart[i];
        chartComp.load24hMore();
      }
    },

    addRadarVar(radarVarIn, opt) {
      let radarVar = new RadarVariableClass(radarVarIn);
      radarVar.selOption = opt;
      this.selectedVars.push(radarVar);
      this.selectedVarsVisibility.push(true);
      for (let i = 0; i < this.radars.length; i++) {
        let chartComp = this.$refs.chart[i];
        chartComp.addRadarVar(radarVar, opt);
      }
    },

    changeVarVisibility(index) {
      // Change the visibility of that variable
      this.selectedVarsVisibility[index] = !this.selectedVarsVisibility[index];
      // Apply to existing charts
      for (let i = 0; i < this.radars.length; i++) {
        let chartComp = this.$refs.chart[i];
        chartComp.setVariableVisible(index, this.selectedVarsVisibility[index]);
      }
    },

    onHoverOnVariable(index) {
      // Apply to existing charts
      if (this.selectedVarsVisibility[index]) {
        for (let i = 0; i < this.radars.length; i++) {
          let chartComp = this.$refs.chart[i];
          chartComp.highlightVariable(index);
        }
      }
    },
    onMouseLeaveVariable() {
      // Apply to existing charts
      for (let i = 0; i < this.radars.length; i++) {
        let chartComp = this.$refs.chart[i];
        chartComp.resetVariableHighlights();
      }

    }
  },
  components: {
    TopIcons,
    Chart
  }
}
</script>



<style scoped>
.main-container {
  position: fixed;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}


.title {
  text-align: center;
  padding-top: 50px;
  padding-bottom: 20px;
  background-color: var(--blue);
  color: white;
  font-family: "Poppins", Sans-serif;
  font-size: 30px;
  font-weight: 400;
  font-weight: bold;
  text-transform: none;
  line-height: 35px;
  z-index: 2;
}



.options-container {
  display: flex;
  justify-content: center;
  padding: 5px;
}


.highchartsLegendCircleColor {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 10px;
  border: solid 1px white;
  box-shadow: 0 0 4px black;
  pointer-events: none;
}



.table-container {
  padding: min(5%, 30px);
  font-size: small;

  display: flex;
  flex-direction: column;
  align-items: center;
}

table {
  border-collapse: collapse;
  border: none;
}

.table-header {
  background: linear-gradient(to right, transparent 0%, rgb(94 173 213) 10%, rgb(94 173 213) 90%, transparent 100%);
}



.oddRow {
  background: linear-gradient(to right, transparent 0%, rgb(205, 239, 255) 10%, rgb(205, 239, 255) 90%, transparent 100%);
}

.variable-name-cell {
  font-weight: bold;
  padding: min(2%, 10px);
}

.graphs-radars-container {
  overflow-y: auto;
  height: -webkit-fill-available;
}

.graph-radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
}

.graph-radar-map-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  width: calc(100% - 50px);
  justify-content: center;
  max-width: 1200px;
}

.graph-container {
  width: 80%;
  height: 200px;
  background-color: var(--lightBlue);
  position: relative;
}

.map-container {
  width: 200px;
  height: 200px;
  background-color: var(--red);
}



.imgs-radars-container {
  background-color: var(--darkBlue);
  height: 50px;
  bottom: 0px;
  overflow-x: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}


.options-td {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}



.selected-variable-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 5px;
}

/* .img-radar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  margin-right: 20px;
  justify-content: center;
}

.img-radar-title {
  position: absolute;
}

.filler-img {
  width: 150px;
  height: 150px;
  background-color: aqua;
} */


@media screen and (max-width: 770px) {
  .title {
    font-size: 20px;
    padding-top: 30px;
    padding-bottom: 10px;
  }

  .graph-radar-map-container {
    width: 100%;
  }

  .graph-container {
    width: 95%;
  }

  .options-container {
    padding: 0px;
  }

  .selected-variable-container {
    padding: 0px;
  }
}
</style>
