<template>
  <TopIcons></TopIcons>
  <!-- Page container -->
  <div class="main-container">
    <!-- Radials title -->
    <div class="title">{{ $t('HF Radars network status') }}</div>
    <!-- Temporal status radials -->
    <div class="graphs-radars-container">
      <div class="graph-radar-container" v-for="rr in radars">
        <div>{{ rr }}</div>
        <div>Some graph</div>
        <div>Explore in interactive map</div>
      </div>
    </div>

    <!-- Bottom images of radars -->
    <div class="imgs-radars-container">
      <div v-for="rr in radars" class="img-radar-container">
        <div class="img-radar-title ">{{ rr }}</div>
        <div class="filler-img"></div>
      </div>
    </div>
  </div>
</template>


<script setup>
import TopIcons from './components/TopIcons.vue';

const radars = ['CREU', 'BEGU', 'AREN', 'PBCN', 'GNST'];
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
}

.graph-radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
}


.imgs-radars-container {
  background-color: blue;
  height: 180px;
  bottom: 0px;
  overflow-x: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.img-radar-container {
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
}

@media screen and (max-width: 770px) {
  .title {
    font-size: 20px;
  }
}
</style>
