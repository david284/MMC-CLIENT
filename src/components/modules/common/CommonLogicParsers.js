import jsonLogic from 'json-logic-js'
import * as mfdLogic from "components/modules/common/mdfLogic.js";


export function overloadedLabel (nodeNumber, element, store) {
  var result = null
  if (element.nv){
    var value = store.state.nodes[nodeNumber].nodeVariables[element.nv]
    for (var i in element.labels){
      if (value == element.labels[i].value){
        result = element.labels[i].label
      }
    }
  }
//  console.log('overloadedLabel: element ' + JSON.stringify(element) + ' result = ' + result)
  return result
}


//
// the 'logic' variable determines what logic case should be evaluated
// The use of argument3 is depenadant on the specific logic case (as defined by the logic variable)
// So check the individual logic cases to see if it's necessary, and what it should contain
//
export function parseLogicElement (nodeNumber, logic, store, argument3) {
  var result = true

  //logic for event variable bits
  // in this logic case, argument3 is the event identifier
  if (logic.evBit != undefined){
    if (argument3 != undefined){
      var eventVariables = store.state.nodes[nodeNumber].storedEventsNI[argument3]
      if (eventVariables){
        var value = eventVariables.variables[logic.evBit.index]
        value = (value & 2 ** logic.evBit.bit) >> logic.evBit.bit
        result = testCondition(value, logic)
//        console.log(`parseLogicElement: evBit result = ` + result)
      } else { console.log(`parseLogicElement: ERROR: evBit - event variables undefined ` ) }
    } else { console.log(`parseLogicElement: ERROR: evBit - event index (argument3) not defined `) }
  }

  //logic for event variables
  // in this logic case, argument3 is the event identifier
  if (logic.ev != undefined){
    if (argument3 != undefined){
      var eventVariables = store.state.nodes[nodeNumber].storedEventsNI[argument3]
      if (eventVariables){
        var value = eventVariables.variables[logic.ev]
        result = testCondition(value, logic)
//        console.log(`parseLogicElement: ev result = ` + result)
      } else { console.log(`parseLogicElement: ERROR: ev - event variables undefined ` ) }
    } else { console.log(`parseLogicElement: ERROR: ev - event index (argument3) not defined `) }
  }

  //logic for node variable bits
  if (logic.nvBit != undefined){
    var value = store.state.nodes[nodeNumber].nodeVariables[logic.nvBit.index]
    value = (value & 2 ** logic.nvBit.bit) >> logic.nvBit.bit
    result = testCondition(value, logic)
//    console.log(`parseLogicElement: nvBit result = ` + result)
  }

  // logic for node variables
  if (logic.nv != undefined){
    var value = store.state.nodes[nodeNumber].nodeVariables[logic.nv]
    result = testCondition(value, logic)
//    console.log(`parseLogicElement: nv result = ` + result)
  }

  // 
  // call to use jsonLogic
  //
  if (logic.JLL != undefined){
    let Logic = new mfdLogic.mdfLogic()
    result = Logic.evaluate(store.state.nodes[nodeNumber], logic.JLL, argument3)
  }


  /*
  // logic for slot - slot is an alias for event index
  // where fixed event index 'slots' are used
  if (logic.slot != undefined){
    var value = store.state.selected_event_index
    result = testCondition(value, logic)
    console.log(`parseLogicElement: slot result = ` + result)
  }
*/

  return result
}

function testCondition(value, logic){
//  console.log(`testCondition: value ` + value + ' logic ' + JSON.stringify(logic))
  var result = true;

  if (logic.equals != undefined){
    //console.log(`testCondition: equals ` + JSON.stringify(logic.equals))
    if (logic.equals != value) {result = false}
  }

  if (logic.greaterThan != undefined){
    //console.log(`testCondition: greaterThan ` + JSON.stringify(logic))
    if (value <= logic.greaterThan) {result = false}
  }

  // tests input value equals one of the array values
  if (logic.in != undefined){
    //console.log(`testCondition: equalsOR ` + JSON.stringify(logic.equalsOR))
    result = false    // assume not equal to begin with
    logic.in.forEach(function(logicValue) {
      if(value == logicValue) {result = true}
    });
  }

  if (logic.lessThan != undefined){
    //console.log(`testCondition: lessThan ` + JSON.stringify(logic))
    if (value >= logic.lessThan) {result = false}
  }

  if (logic.notEqual != undefined){
    //console.log(`testCondition: notEqual ` + JSON.stringify(logic.notEqual))
    if (logic.notEqual == value) {result = false}
  }

  return result
}

/*
export function jsonLogicTest (node, logicExpression) {
  try{
    var NVoperator = function(a){
      return node.nodeVariables[a]
    };
    jsonLogic.add_operation("NV", NVoperator);
    let result = jsonLogic.apply(logicExpression)
    console.log("jsonLogicTest result " + result)
    return result
  } catch(err){
    console.log("jsonLogicTest " + err)
    return false 
  }
}
  */

