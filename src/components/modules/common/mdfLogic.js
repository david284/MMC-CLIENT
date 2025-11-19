import jsonLogic from 'json-logic-js'
import jcc from 'json-case-convertor'
import * as utils from "components/functions/utils.js"

export class mdfLogic {

  constructor() {
    //utils.timeStampedLog("mdfLogic Constructor")
    this.node = undefined
    this.eventIdentifier = undefined

    //
    // event variable operators
    //

    var EVoperator = function(a){
      //utils.timeStampedLog(`mdfLogic.parse EVoperator ${this.eventIdentifier} ${a}`)
      if (this.store.getters.node_useEventIndex(this.nodeNumber) == true){
        utils.timeStampedLog(`mdfLogic.parse EVoperator by Index ${this.eventIdentifier} ${a}`)
        return this.node.eventsByIndex[this.eventIndex].variables[a]
      } else {
        utils.timeStampedLog(`mdfLogic.parse EVoperator by Identifier ${this.eventIdentifier} ${a}`)
        return this.node.storedEventsNI[this.eventIdentifier].variables[a]
      }
    }.bind(this);
    jsonLogic.add_operation("ev", EVoperator);

    var EVbitOperator = function(a, b){
      let eventVariable = undefined
      let result = false
      if (this.store.getters.node_useEventIndex(this.nodeNumber)){
        eventVariable =  this.node.eventsByIndex[this.eventIndex].variables[a]
      } else {
        eventVariable = this.node.storedEventsNI[this.eventIdentifier].variables[a]
      }
      if ((eventVariable & 2**b) > 0) { result = true}
      return result
    }.bind(this);
    jsonLogic.add_operation("evbit", EVbitOperator);

    //
    // event index operator
    //
    var INDEXoperator = function(){
      return this.eventIndex
    }.bind(this);
    jsonLogic.add_operation("index", INDEXoperator);

    //
    // node parameter operators
    //

    var NPoperator = function(a){
      return this.node.parameters[a]
    }.bind(this);
    jsonLogic.add_operation("np", NPoperator);

    var NPbitOperator = function(a, b){
      let result = false
      if ((this.node.parameters[a] & 2**b) > 0) { result = true}
      return result
    }.bind(this);
    jsonLogic.add_operation("npbit", NPbitOperator);

    //
    // node variable operators
    //

    var NVoperator = function(a){
      return this.node.nodeVariables[a]
    }.bind(this);
    jsonLogic.add_operation("nv", NVoperator);


    var NVbitOperator = function(a, b){
      let result = false
      if ((this.node.nodeVariables[a] & 2**b) > 0) { result = true}
      return result
    }.bind(this);
    jsonLogic.add_operation("nvbit", NVbitOperator);


  }


  //
  // main method to evaluate expression
  // will always need node & logic expression to evaluate
  // will only need eventIdentifier if EV or EVbit operators used
  // added jcc library to convert all logic operations to lower case
  //
  evaluate(store, nodeNumber, logicExpression, eventIdentifier, eventIndex){
    this.store = store
    this.nodeNumber = nodeNumber
    this.node = store.state.nodes[nodeNumber]
    this.eventIdentifier = eventIdentifier
    this.eventIndex = eventIndex
    // ensure all operations (keys) are lower case
    let lowercaseLogicExpression = jcc.lowerCaseKeys(logicExpression)
    //utils.timeStampedLog("mdfLogic.parse " + JSON.stringify(this.node))
    //utils.timeStampedLog("mdfLogic.parse " + JSON.stringify(lowercaseLogicExpression))
    //utils.timeStampedLog("mdfLogic.parse " + eventIdentifier)
    try{
      let result = jsonLogic.apply(lowercaseLogicExpression)
      /*
      utils.timeStampedLog("mdfLogic.parse:"
        + ' logic: ' + JSON.stringify(lowercaseLogicExpression)
        + ' result: ' + result )
      */
      return result
    } catch(err){
      utils.timeStampedLog("mdfLogic.parse " + err)
      return false
    }
  }

}
