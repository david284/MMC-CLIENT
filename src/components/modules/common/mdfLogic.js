import jsonLogic from 'json-logic-js'

export class mdfLogic {

  constructor() {
    console.log("mdfLogic Constructor")
    this.node = undefined
    this.eventIdentifier = undefined

    //
    // event variable operators
    //

    var EVoperator = function(a){
      return this.node.storedEventsNI[this.eventIdentifier].variables[a]
    }.bind(this);
    jsonLogic.add_operation("EV", EVoperator);

    var EVbitOperator = function(a, b){
      let result = false
      let eventVariable = this.node.storedEventsNI[this.eventIdentifier].variables[a]
      if ((eventVariable & 2**b) > 0) { result = true}
      return result
    }.bind(this);
    jsonLogic.add_operation("EVbit", EVbitOperator);

    //
    // node parameter operators
    //

    var NPoperator = function(a){
      return this.node.parameters[a]
    }.bind(this);
    jsonLogic.add_operation("NP", NPoperator);

    var NPbitOperator = function(a, b){
      let result = false
      if ((this.node.parameters[a] & 2**b) > 0) { result = true}
      return result
    }.bind(this);
    jsonLogic.add_operation("NPbit", NPbitOperator);

    //
    // node variable operators
    //

    var NVoperator = function(a){
      return this.node.nodeVariables[a]
    }.bind(this);
    jsonLogic.add_operation("NV", NVoperator);

    
    var NVbitOperator = function(a, b){
      let result = false
      if ((this.node.nodeVariables[a] & 2**b) > 0) { result = true}
      return result
    }.bind(this);
    jsonLogic.add_operation("NVbit", NVbitOperator);


  }


  //
  // method to evaluate expression
  // will always need node & lociexpression to evaluate
  // will only need eventIdentifier if EV or EVbit operators used
  //
  evaluate(node, logicExpression, eventIdentifier){
    this.node = node
    this.eventIdentifier = eventIdentifier
//    console.log("mdfLogic.parse " + JSON.stringify(node))
//    console.log("mdfLogic.parse " + JSON.stringify(logicExpression))
//    console.log("mdfLogic.parse " + eventIdentifier)
    try{
      let result = jsonLogic.apply(logicExpression)
      console.log("mdfLogic.parse result " + result)
      return result
    } catch(err){
      console.log("mdfLogic.parse " + err)
      return false 
    } 
  }

}
