"use strict";
const name = "ImportFunctions"
const convert = require('xml-js');
const XLSX = require('xlsx');

import {decToHex} from "components/functions/utils.js"

//
//
export function importFCU(file, store, modeValue) {

  //
  //
  var fcuConfig
  try{
    fcuConfig = convert.xml2js(file, { compact: true })
  } catch (err){
    console.log(name + ': Import Node: convert.xml2js: ' + err )        
    throw "convert.xml2js: " + err;
  }

  //
  // import nodes
  try {
    fcuConfig.MergModuleDataSet.userNodes.forEach( node => {
      addNodeName(store, parseInt(node.nodeNum._text), node.nodeName._text, modeValue)
      addNodeModulename(store, parseInt(node.nodeNum._text), node.moduleName._text, modeValue)
    })
  } catch (err) {
    console.log(name + ': Import Node: userNodes ' + err )    
  }

  //
  // import events
  let eventRows = []
  try {
    fcuConfig.MergModuleDataSet.userEvents.forEach( event => {
      addEventName(store, event.eventNode._text, event.eventId, event.eventName._text, modeValue)
    })
  } catch (err){
    console.log(name + ': Import Node: userEvents ' + err )        
  }
};

//
//
export function importSPREADSHEET(file, store, modeValue) {
  console.log(name + ': importSPREADSHEET: file size ' + file.byteLength)
  let importedEvents = {}
  let importedNodes = {}        
  try{
    const workbook = XLSX.read(file,{'type':'binary'});
    if (workbook.Workbook != undefined){
      for (let i =0; i< workbook.SheetNames.length; i++){
//        console.log (name + "importSPREADSHEET: SheetName: " + workbook.SheetNames[i])
        if (workbook.SheetNames[i].toUpperCase() == "EVENTS"){
          importedEvents = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])
          console.log (name + "importSPREADSHEET: workbook number of Events  imported: " + importedEvents.length)
          for ( let j=0; j < importedEvents.length; j++) {
            if (importedEvents[j].eventNumber != undefined){
              console.log (name + `importSPREADSHEET: workbook events: 
                ${importedEvents[j].eventName}  
                ${importedEvents[j].nodeNumber}:${importedEvents[j].eventNumber}`)
            }
            addEventName(store, importedEvents[j].nodeNumber, importedEvents[j].eventNumber, importedEvents[j].eventName, modeValue)
            addEventGroup(store, importedEvents[j].nodeNumber, importedEvents[j].eventNumber, importedEvents[j].eventGroup, modeValue)
          }
        }
        if (workbook.SheetNames[i].toUpperCase() == "NODES"){
          importedNodes = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])   
          console.log (name + "importSPREADSHEET: workbook number of Nodes imported: " + importedNodes.length)
          for ( let j=0; j < importedNodes.length; j++) {
            if(importedNodes[j].nodeNumber != undefined){
              console.log (name + `importSPREADSHEET: workbook Nodes: ${importedNodes[j].nodeName} ${importedNodes[j].nodeNumber}`)
              addNodeName(store, importedNodes[j].nodeNumber, importedNodes[j].nodeName, modeValue)
              addNodeGroup(store, importedNodes[j].nodeNumber, importedNodes[j].nodeGroup, modeValue)
              addNodeModulename(store, importedNodes[j].nodeNumber, importedNodes[j].moduleName, modeValue)
            }
          }
        }
      }
    } else {
      throw new Error("Workbook undefined")
    }

  } catch (err){
    console.log(name + ': importSPREADSHEET ' + err )
    throw err;
  }
}

//
//
function addEventName(store, eventNodeNumber, eventNumber, eventName, modeValue){
  let eventIdentifier = decToHex(eventNodeNumber,4) + decToHex(eventNumber,4)
  if (store.state.layout.eventDetails[eventIdentifier] == undefined){
    // event doesn't exist
    store.setters.event_name(eventIdentifier, eventName)
    console.log("new event: " + eventIdentifier + ' addEventName: ' + eventName)
  } else if ((store.state.layout.eventDetails[eventIdentifier].name == undefined) ||
    (store.state.layout.eventDetails[eventIdentifier].name.length < 1)){
    // event name doesn't exist
    store.setters.event_name(eventIdentifier, eventName)
    console.log('Event: ' + eventIdentifier + ": addEventName: " + eventName + ' updated')
  } else  if (store.state.layout.eventDetails[eventIdentifier].name == eventName) {
    console.log('Event: ' + eventIdentifier + ": addEventName: " + eventName + ' match')
    // do nothing
  } else {
    if (modeValue == "overwrite"){
      store.setters.event_name(eventIdentifier, eventName)
      console.log('Event ' + eventIdentifier + ": addEventName: " + eventName + " overwrite")
    } else {
      console.log('Event ' + eventIdentifier + ": addEventName: " + eventName + " retain")
    }
  }
}

//
//
function addEventGroup(store, eventNodeNumber, eventNumber, eventGroup, modeValue){
  let eventIdentifier = decToHex(eventNodeNumber,4) + decToHex(eventNumber,4)
  if (store.state.layout.eventDetails[eventIdentifier] == undefined){
    // event doesn't exist
    store.setters.event_group(eventIdentifier, eventGroup)
    console.log("new event: " + eventIdentifier + ' addEventGroup: ' + eventGroup)
  } else if ((store.state.layout.eventDetails[eventIdentifier].group == undefined) ||
    (store.state.layout.eventDetails[eventIdentifier].group.length < 1)){
    // event name doesn't exist
    store.setters.event_group(eventIdentifier, eventGroup)
    console.log('Event: ' + eventIdentifier + ": addEventGroup: " + eventGroup + ' updated')
  } else  if (store.state.layout.eventDetails[eventIdentifier].group == eventGroup) {
    console.log('Event: ' + eventIdentifier + ": addEventGroup: " + eventGroup + ' match')
    // do nothing
  } else {
    if (modeValue == "overwrite"){
      store.setters.event_group(eventIdentifier, eventGroup)
      console.log('Event ' + eventIdentifier + ": addEventGroup: " + eventGroup + " overwrite")
    } else {
      console.log('Event ' + eventIdentifier + ": addEventGroup: " + eventGroup + " retain")
    }
  }
}


function addNodeName(store, nodeNumber, nodeName, modeValue){
  // not interested in node 0, so skip
  if (nodeNumber > 0){
    if (store.state.layout.nodeDetails[nodeNumber] == undefined){
      // node doesn't exist, so create it with name
      store.setters.node_name(nodeNumber, nodeName)
      console.log("new node: " + nodeNumber + ": NodeName: " + nodeName)
    } else if ((store.state.layout.nodeDetails[nodeNumber].name == undefined ) ||
      (store.state.layout.nodeDetails[nodeNumber].name.length < 1 )){
      // node not named, so name it
      store.setters.node_name(nodeNumber, nodeName)
      console.log('node ' + nodeNumber + ": addNodeName: " + nodeName + ' updated')
    } else if (store.state.layout.nodeDetails[nodeNumber].name == nodeName) {
      console.log('node ' + nodeNumber + ": addNodeName: " + nodeName + ' match')
      // do nothing
    } else {
      // stored name doesn't match import name
      if (modeValue == "overwrite"){
        console.log('node ' + nodeNumber + ": addNodeName: " + nodeName + " no match - overwrite")
        store.setters.node_name(nodeNumber, nodeName)
      } else {
        console.log('node ' + nodeNumber + ": addNodeName: " + nodeName + " no match - retain")
      }
    }
  }
}

function addNodeGroup(store, nodeNumber, nodeGroup, modeValue){
  // not interested in node 0, so skip
  if (nodeNumber > 0){
    if (store.state.layout.nodeDetails[nodeNumber] == undefined){
      // node doesn't exist, so create it with group
      store.setters.node_group(nodeNumber, nodeGroup)
      console.log("new node: " + nodeNumber + ": nodeGroup: " + nodeGroup)
    } else if ((store.state.layout.nodeDetails[nodeNumber].group == undefined ) ||
      (store.state.layout.nodeDetails[nodeNumber].group.length < 1 )){
      // node not named, so name it
      store.setters.node_group(nodeNumber, nodeGroup)
      console.log('node ' + nodeNumber + ": nodeGroup: " + nodeGroup + ' updated')
    } else if (store.state.layout.nodeDetails[nodeNumber].group == nodeGroup) {
      console.log('node ' + nodeNumber + ": nodeGroup: " + nodeGroup + ' match')
      // do nothing
    } else {
      // stored name doesn't match import name
      if (modeValue == "overwrite"){
        console.log('node ' + nodeNumber + ": nodeGroup: " + nodeGroup + " no match - overwrite")
        store.setters.node_group(nodeNumber, nodeGroup)
      } else {
        console.log('node ' + nodeNumber + ": nodeGroup: " + nodeGroup + " no match - retain")
      }
    }
  }
}

function addNodeModulename(store, nodeNumber, moduleName, modeValue){
  // not interested in node 0, so skip
  if (nodeNumber > 0){
    if (store.state.layout.nodeDetails[nodeNumber] == undefined){
      // node doesn't exist, so create it with moduleName
      store.setters.node_moduleName(nodeNumber, moduleName)
      console.log("new node: " + nodeNumber + ": moduleName: " + moduleName)
    } else if ((store.state.layout.nodeDetails[nodeNumber].moduleName == undefined ) ||
      (store.state.layout.nodeDetails[nodeNumber].moduleName.length < 1 )){
      store.setters.node_moduleName(nodeNumber, moduleName)
      console.log('node ' + nodeNumber + ": moduleName: " + moduleName + ' updated')
    } else if (store.state.layout.nodeDetails[nodeNumber].moduleName == moduleName) {
      console.log('node ' + nodeNumber + ": moduleName: " + moduleName + ' match')
      // do nothing
    } else {
      // stored name doesn't match import name
      if (modeValue == "overwrite"){
        console.log('node ' + nodeNumber + ": moduleName: " + moduleName + " no match - overwrite")
        store.setters.node_moduleName(nodeNumber, moduleName)
      } else {
        console.log('node ' + nodeNumber + ": moduleName: " + moduleName + " no match - retain")
      }
    }
  }
}
