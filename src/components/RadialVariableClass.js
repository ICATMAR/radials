class RadialVariableClass {
  constructor (variableData){
    this.name = variableData.name;
    this.description= variableData.description;
    this.units= variableData.units;
    this.label= variableData.label;
    this.options= [...variableData.options];
    this.calculate= variableData.calculate;
    this.type= variableData.type;
  }
}

export default RadialVariableClass;