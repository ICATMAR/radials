<template>
  <TopIcons></TopIcons>
  <!-- Page container -->
  <div class="main-container">
    <!-- Radials title -->
    <div class="title">{{ $t('HF Radars network status') }}</div>
    <div class="options-container" @click="isVariablesTableVisible = false" v-show="isVariablesTableVisible">
      <!-- Select axis table -->
      <table>
        <tr>
          <th>{{ $t('Name') }}</th>
          <th>{{ $t('Description') }}</th>
          <th>{{ $t('Options') }}</th>
        </tr>
        <tr v-for="ax in axesData">
          <td>{{ ax.name }}</td>
          <td>{{ ax.description }}</td>
          <td class="options-td">
            <button @click="() => addAxis(ax, opt)" v-for="opt in ax.options">{{ opt }}</button>
          </td>
        </tr>
      </table>
    </div>


    <!-- Selected axis -->
    <div class="selected-axis-container">
      <button v-for="sAx in selectedAxes">{{ sAx.name }}</button>
      <button @click="isVariablesTableVisible = true">{{ $t('Visualize more data +') }}</button>
    </div>
    <div class="options-container">
      <button @click="loadPrevious24h">
        <{{ $t('Load previous 24h') }}</button>
    </div>
    <!-- Temporal status radials -->
    <div class="graphs-radars-container">
      <div class="graph-radar-container" v-for="rr in radars">
        <!-- <div>{{ rr }}</div> -->
        <div class="graph-radar-map-container">
          <div class="graph-container">
            <Chart ref='chart' :antennaID=rr :axesData="selectedAxes" />
          </div>
          <div class="map-container">Explore in interactive map</div>
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
import Chart from './components/RadialChart.vue';
import axesDataFile from "./components/RadialChartAxis.js";

export default {
  data() {
    return {
      radars: ['CREU', 'BEGU', 'AREN', 'PBCN', 'GNST'],
      axesData: axesDataFile,
      selectedAxes: [axesDataFile[0]],
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

    addAxis(axis, opt) {
      this.selectedAxes.push(axis);
      for (let i = 0; i < this.radars.length; i++) {
        let chartComp = this.$refs.chart[i];
        chartComp.addAxis(axis, opt);
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



.selected-axis-container {
  display: flex;
  justify-content: center;
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
  }

  .graph-radar-map-container {
    width: 100%;
  }

  .graph-container {
    width: 95%;
  }
}
</style>
