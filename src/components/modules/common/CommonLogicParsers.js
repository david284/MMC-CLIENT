

export function parseLogicElement (logic, store, argument3) {
  var result = true

  //logic for event variables
  if (logic.evBit != undefined){
    if (argument3 != undefined){
      // in this logic case, argument3 is the event index
      var eventVariables = store.state.nodes[store.state.selected_node].storedEvents[argument3]
      var value = eventVariables.variables[logic.evBit.index]
      value = (value & 2 ** logic.evBit.bit) >> logic.evBit.bit
      result = testCondition(value, logic)
      console.log(`parseLogicElement: evBit result = ` + result)
    } else { console.log(`parseLogicElement: ERROR: evBit - event index (argument3) not defined `) }
  }

  // logic for node variables
  if (logic.nv != undefined){
    var value = store.state.nodes[store.state.selected_node].nodeVariables[logic.nv]
    result = testCondition(value, logic)
    console.log(`parseLogicElement: nv result = ` + result)
  }

  return result
}

function testCondition(value, logic){
  var result = true;
  if (logic.equals != undefined){
    //console.log(`testCondition: equals ` + JSON.stringify(logic.equals))
    if (logic.equals != value) {result = false}
  }

  // tests input value equals one of the array values
  if (logic.in != undefined){
    //console.log(`testCondition: equalsOR ` + JSON.stringify(logic.equalsOR))
    result = false    // assume not equal to begin with
    logic.in.forEach(function(logicValue) {
      if(value == logicValue) {result = true}
    });
  }
  if (logic.notEqual != undefined){
    //console.log(`testCondition: notEqual ` + JSON.stringify(logic.notEqual))
    if (logic.notEqual == value) {result = false}
  }
  return result
}



