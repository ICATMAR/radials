export default [
  // Number of points
  {
    name: "Nº points",
    description: "Counts the number of points of the data provided by a radar at a given hour.",
    units: "points",
    label: "{value}",
    options: ["All", "Only valid points"],
    calculate: (points, option) => {
      if (points == undefined)
        return 0;
      if (option == undefined || option == "All") {
        return points.length;
      } else if (option == "Only valid points") {
        return points.filter(p =>
          p["Q201 (flag)"] == 1 &&
          p["Q202 (flag)"] == 1 &&
          p["Q203 (flag)"] == 1 &&
          p["Q204 (flag)"] == 1 &&
          p["Q205 (flag)"] == 1 &&
          (p["Q206 (flag)"] == 1 || p["Q206 (flag)"] == 2) &&
          p["Q207 (flag)"] == 1).length;
      }
    },
    type: "column", // "spline"
  },


  // Number of flagged points
  {
    name: "Nº flagged points",
    description: "Counts the number of points of the data provided by a radar at a given hour that have been flagged in the quality checks." +
      "Q201 stands for... Q202 stands for... Q203 stands for... Q204 stands for... Q205 stands for... Q206 stands for... Q207 stands for...",
    units: "flagged points",
    label: "{value}",
    options: ["All", "Q201", "Q202", "Q203", "Q204", "Q205", "Q206", "Q207"],
    calculate: (points, option) => {
      if (points == undefined)
        return 0;
      // Return points flagged by any flag
      if (option == undefined || option == "All") {
        return points.filter(p =>
          p["Q201 (flag)"] != 1 ||
          p["Q202 (flag)"] != 1 ||
          p["Q203 (flag)"] != 1 ||
          p["Q204 (flag)"] != 1 ||
          p["Q205 (flag)"] != 1 ||
          p["Q206 (flag)"] != 1 ||
          p["Q207 (flag)"] != 1).length;
      } else if (option.includes("Q20")) {
        return points.filter(p => p[option + " (flag)"] != 1).length;
      }
    },
    type: "spline", // "spline", "column"
  },



  // Spatial Count
  {
    name: "Spatial Count",
    description: "Average / maximum / minimum of the spatial count used for each point.",
    units: "spatial count",
    label: "{value}",
    options: ["Average", "Maximum", "Minimum"],
    calculate: (points, option) => {
      if (points == undefined)
        return 0;
      // Calculates the average spatial count
      if (option == undefined || option == "Average") {
        let sum = points.reduce((acc, point) => acc + (point["Spatial Count"] || 0), 0);
        return sum / points.length;
      } else if (option == "Maximum") {
        return Math.max(...points.map(point => point["Spatial Count"] || 0));
      } else if (option == "Minimum")
        return Math.min(...points.map(point => point["Spatial Count"] || 0));
    },
    type: "line", // "spline", "column", "line", "bar"
    step: "center", // https://www.highcharts.com/docs/chart-and-series-types/line-chart
  },



  // Temporal Count
  {
    name: "Temporal Count",
    description: "Average / maximum / minimum of the temporal count used for each point.",
    units: "temporal count",
    label: "{value}",
    options: ["Average", "Maximum", "Minimum"],
    calculate: (points, option) => {
      if (points == undefined)
        return 0;
      // Calculates the average spatial count
      if (option == undefined || option == "Average") {
        let sum = points.reduce((acc, point) => acc + (point["Temporal Count"] || 0), 0);
        return sum / points.length;
      } else if (option == "Maximum") {
        return Math.max(...points.map(point => point["Temporal Count"] || 0));
      } else if (option == "Minimum")
        return Math.min(...points.map(point => point["Temporal Count"] || 0));
    },
    type: "line", // "spline", "column", "line", "bar"
    step: "center", // https://www.highcharts.com/docs/chart-and-series-types/line-chart
  },


  


  // Spatial Quality
  {
    name: "Spatial Quality",
    description: "Average / maximum / minimum of the spatial quality of the points.",
    units: "spatial quality",
    label: "{value}",
    options: ["Average", "Maximum", "Minimum"],
    calculate: (points, option) => {
      if (points == undefined)
        return 0;
      // Calculates the average spatial quality
      if (option == undefined || option == "Average") {
        let sum = points.reduce((acc, point) => acc + (point["Spatial Quality"] || 0), 0);
        return sum / points.length;
      } else if (option == "Maximum") {
        return Math.max(...points.map(point => point["Spatial Quality"] || 0));
      } else if (option == "Minimum")
        return Math.min(...points.map(point => point["Spatial Quality"] || 0));
    },
    type: "spline", // "spline", "column", "line", "bar"
  },

  // Temporal Quality
  {
    name: "Temporal Quality",
    description: "Average / maximum / minimum / standard deviation of the temporal quality of the points.",
    units: "temporal quality",
    label: "{value}",
    options: ["Average", "Maximum", "Minimum", "STD"],
    calculate: (points, option) => {
      if (!points || points.length === 0) return 0;
      
      let values = points.map(point => point["Temporal Quality"] || 0);

      if (option === undefined || option === "Average") {
        return values.reduce((acc, val) => acc + val, 0) / values.length;
      } else if (option === "Maximum") {
        return Math.max(...values);
      } else if (option === "Minimum") {
        return Math.min(...values);
      } else if (option === "STD") {
        let mean = values.reduce((acc, val) => acc + val, 0) / values.length;
        let variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
      }
    },
    type: "spline", // "spline", "column", "line", "bar"
  },





  // SNR
  {
    name: "SNR",
    description: "Average / maximum / minimum of the signal-to-noise ratio (SNR) of the points.",
    units: "dB SNR",
    label: "{value}",
    options: ["Average", "Maximum", "Minimum"],
    calculate: (points, option) => {
      if (points == undefined)
        return 0;
      // Calculates 
      if (option == undefined || option == "Average") {
        let sum = points.reduce((acc, point) => acc + (point["SNR (dB)"] || 0), 0);
        return sum / points.length;
      } else if (option == "Maximum") {
        return Math.max(...points.map(point => point["SNR (dB)"] || 0));
      } else if (option == "Minimum")
        return Math.min(...points.map(point => point["SNR (dB)"] || 0));
    },
    type: "spline", // "spline", "column", "line", "bar"
  },


];