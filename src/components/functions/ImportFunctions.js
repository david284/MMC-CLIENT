"use strict";
const name = "ImportFunctions"

import {decToHex} from "components/functions/utils.js"

//
//
export function importFCU(fcuConfig, store, modeValue) {
  //
  // import nodes
  try {
    fcuConfig.MergModuleDataSet.userNodes.forEach( node => {
      //console.log(name + ': Import Node ' + node.nodeNum._text + ' ' + node.nodeName._text)
      let nodeNumber = parseInt(node.nodeNum._text)
      // not interested in node 0, so skip
      if (nodeNumber > 0){
        let nodeName = node.nodeName._text
        let moduleName = node.moduleName._text
        if (store.state.layout.nodeDetails[nodeNumber] == undefined){
          // node doesn't exist, so create it with name
          store.setters.node_name(nodeNumber, nodeName)
          store.setters.node_moduleName(nodeNumber, moduleName)
          console.log("new node " + nodeNumber + ": " + nodeName)
        } else if ((store.state.layout.nodeDetails[nodeNumber].name == undefined ) ||
          (store.state.layout.nodeDetails[nodeNumber].name.length < 1 )){
          // node not named, so name it
          store.setters.node_name(nodeNumber, nodeName)
          store.setters.node_moduleName(nodeNumber, moduleName)
          console.log('node ' + nodeNumber + ": " + nodeName + ' updated')
        } else if (store.state.layout.nodeDetails[nodeNumber].name == nodeName) {
          console.log('node ' + nodeNumber + ": " + nodeName + ' stored name matches import name')
          // do nothing
        } else {
          // stored name doesn't match import name
          if (modeValue == "overwrite"){
            console.log('node ' + nodeNumber + ": " + nodeName + " no match - overwrite")
            store.setters.node_name(nodeNumber, nodeName)
            store.setters.node_moduleName(nodeNumber, moduleName)
          } else {
            console.log('node ' + nodeNumber + ": " + nodeName + " no match - retain")
          }
        }
      }
    })
  } catch (err) {
    console.log(name + ': Import Node: userNodes ' + err )    
  }

  //
  // import events
  let eventRows = []
  try {
    fcuConfig.MergModuleDataSet.userEvents.forEach( event => {
      let eventIdentifier = decToHex(event.ownerNode._text,4) + decToHex(event.eventId._text,4)
      let eventName = event.eventName._text
      //console.log('event ' + eventIdentifier + ' ' + JSON.stringify(store.state.layout.eventDetails[eventIdentifier]))

      if (store.state.layout.eventDetails[eventIdentifier] == undefined){
        // event doesn't exist
        store.setters.event_name(eventIdentifier, eventName)
        console.log("new event " + eventIdentifier)
      } else if ((store.state.layout.eventDetails[eventIdentifier].name == undefined) ||
        (store.state.layout.eventDetails[eventIdentifier].name.length < 1)){
        // event name doesn't exist
        store.setters.event_name(eventIdentifier, eventName)
        console.log("new event name " + eventIdentifier + " " + eventName)
      } else  if (store.state.layout.eventDetails[eventIdentifier].name == eventName) {
        console.log("event name matches " + eventIdentifier + " " + eventName)
      } else {
        if (modeValue == "overwrite"){
          store.setters.event_name(eventIdentifier, eventName)
          console.log("event names don't match - overwrite" + eventIdentifier + " " + eventName)
        } else {
          console.log("event name exists - retain " + eventIdentifier + " " + eventName)
        }
      }
    })
  } catch (err){
    console.log(name + ': Import Node: userEvents ' + err )        
  }
};


