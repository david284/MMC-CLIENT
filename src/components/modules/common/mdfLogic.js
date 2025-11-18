import jsonLogic from 'json-logic-js'
import jcc from 'json-case-convertor'

export class mdfLogic {

  constructor() {
//    console.log("mdfLogic Constructor")
    this.node = undefined
    this.eventIdentifier = undefined

    //
    // event variable operators
    //

    var EVoperator = function(a){
      //console.log(`mdfLogic.parse EVoperator ${this.eventIdentifier} ${a}`)
      return this.node.storedEventsNI[this.eventIdentifier].variables[a]
    }.bind(this);
    jsonLogic.add_operation("ev", EVoperator);

    var EVbitOperator = function(a, b){
      let result = false
      let eventVariable = this.node.storedEventsNI[this.eventIdentifier].variables[a]
      if ((eventVariable & 2**b) > 0) { result = true}
      return result
    }.bind(this);
    jsonLogic.add_operation("evbit", EVbitOperator);

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
    this.node = store.state.nodes[nodeNumber]
    this.eventIdentifier = eventIdentifier
    // ensure all operations (keys) are lower case
    let lowercaseLogicExpression = jcc.lowerCaseKeys(logicExpression)
    //console.log("mdfLogic.parse " + JSON.stringify(this.node))
    //console.log("mdfLogic.parse " + JSON.stringify(lowercaseLogicExpression))
    //console.log("mdfLogic.parse " + eventIdentifier)
//    try{
      let result = jsonLogic.apply(lowercaseLogicExpression)
      /*
      console.log("mdfLogic.parse:"
        + ' logic: ' + JSON.stringify(lowercaseLogicExpression)
        + ' result: ' + result )
      */
      return result
      /*
    } catch(err){
      console.log("mdfLogic.parse " + err)
      return false
    }
      */
  }

}
