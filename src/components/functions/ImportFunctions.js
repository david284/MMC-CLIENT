"use strict";
const logPrefix = "ImportFunctions"
const convert = require('xml-js');
const XLSX = require('xlsx');

import {decToHex} from "components/functions/utils.js"
import * as utils from "components/functions/utils.js"

//
//
export function write_import_log(store, data){
  store.state.import_log.push(data)
  utils.timeStampedLog(logPrefix + `: ${data}` )
}

//
//
export function importFCU(file, store, modeValue) {
  //
  //
  var fcuConfig
  try{
    fcuConfig = convert.xml2js(file, { compact: true })
  } catch (err){
    utils.timeStampedLog(logPrefix + ': ImportFCU: convert.xml2js: ' + err )
    store.eventBus.emit('GENERAL_MESSAGE_EVENT', "FCU import failed - check file is valid XML", err, 'warning', 0)
    throw "convert.xml2js: " + err;
  }
  //utils.timeStampedLog(logPrefix + `: ImportFCU: ${JSON.stringify(fcuConfig)}` )
  //
  // import nodes
  // ignore CAN_SW nodes
  try {
    if (Array.isArray(fcuConfig.MergModuleDataSet.userNodes)) {
      fcuConfig.MergModuleDataSet.userNodes.forEach( node => {
        if (node.moduleName._text != "CAN_SW"){
          importNodeName(store, parseInt(node.nodeNum._text), node.nodeName._text, modeValue)
          importModulename(store, parseInt(node.nodeNum._text), node.moduleName._text, modeValue)
        }
      })
    } else{
      let node = fcuConfig.MergModuleDataSet.userNodes
      if (node.moduleName._text != "CAN_SW"){
        importNodeName(store, parseInt(node.nodeNum._text), node.nodeName._text, modeValue)
        importModulename(store, parseInt(node.nodeNum._text), node.moduleName._text, modeValue)
      }
    }
  } catch (err) {
    utils.timeStampedLog(logPrefix + ': ImportFCU: userNodes ' + err )
  }
  //
  // import events
  let eventRows = []
  try {
    if (Array.isArray(fcuConfig.MergModuleDataSet.userEvents)) {
      fcuConfig.MergModuleDataSet.userEvents.forEach( event => {
        if (event.eventValue._text !=0){
          importEventName(store, event.eventNode._text, event.eventValue._text, event.eventName._text, modeValue)
        }
      })
    } else{
      let event = fcuConfig.MergModuleDataSet.userEvents
      importEventName(store, event.eventNode._text, event.eventValue._text, event.eventName._text, modeValue)
    }
  } catch (err){
    utils.timeStampedLog(logPrefix + ': ImportFCU: userEvents ' + err )
  }
};

//
//
export function importSPREADSHEET(file, store, modeValue) {
  write_import_log(store, 'importSPREADSHEET: file size ' + file.byteLength)
  let importedEvents = {}
  let importedNodes = {}
  let importedChannels = {}
  let importedUserNames = {}
  try{
    const workbook = XLSX.read(file,{'type':'binary'});
    if (workbook.Workbook != undefined){
      for (let i =0; i< workbook.SheetNames.length; i++){
        //
        if (workbook.SheetNames[i].toUpperCase() == "SHORT_EVENTS"){
          importedEvents = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])
          utils.timeStampedLog(logPrefix + "importSPREADSHEET: workbook number of Short Events imported: " + importedEvents.length)
          for ( let j=0; j < importedEvents.length; j++) {
            if (importedEvents[j].eventNumber != undefined){
              utils.timeStampedLog(logPrefix + `importSPREADSHEET: workbook events:
                ${importedEvents[j].eventNumber}
                ${importedEvents[j].eventName}
                ${importedEvents[j].eventGroup}
                ${importedEvents[j].eventColour}`)
            }
            importEventName(store, 0, importedEvents[j].eventNumber, importedEvents[j].eventName, modeValue)
            importEventGroup(store, 0, importedEvents[j].eventNumber, importedEvents[j].eventGroup, modeValue)
            importEventColour(store, 0, importedEvents[j].eventNumber, importedEvents[j].eventColour, modeValue)
          }
        }
        //
        if (workbook.SheetNames[i].toUpperCase() == "LONG_EVENTS"){
          importedEvents = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])
          utils.timeStampedLog(logPrefix + "importSPREADSHEET: workbook number of Long Events imported: " + importedEvents.length)
          for ( let j=0; j < importedEvents.length; j++) {
            if (importedEvents[j].eventNumber != undefined){
              utils.timeStampedLog(logPrefix + `importSPREADSHEET: workbook events:
                ${importedEvents[j].eventName}
                ${importedEvents[j].eventNodeNumber}:${importedEvents[j].eventNumber}`)
            }
            importEventName(store, importedEvents[j].eventNodeNumber, importedEvents[j].eventNumber, importedEvents[j].eventName, modeValue)
            importEventGroup(store, importedEvents[j].eventNodeNumber, importedEvents[j].eventNumber, importedEvents[j].eventGroup, modeValue)
            importEventColour(store, importedEvents[j].eventNodeNumber, importedEvents[j].eventNumber, importedEvents[j].eventColour, modeValue)
          }
        }
        //
        if (workbook.SheetNames[i].toUpperCase() == "NODES"){
          importedNodes = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])
          utils.timeStampedLog(logPrefix + "importSPREADSHEET: workbook number of Nodes imported: " + importedNodes.length)
          for ( let j=0; j < importedNodes.length; j++) {
            if(importedNodes[j].nodeNumber != undefined){
              utils.timeStampedLog(logPrefix + `importSPREADSHEET: workbook Nodes: ${importedNodes[j].nodeName} ${importedNodes[j].nodeNumber}`)
              importNodeName(store, importedNodes[j].nodeNumber, importedNodes[j].nodeName, modeValue)
              importNodeGroup(store, importedNodes[j].nodeNumber, importedNodes[j].nodeGroup, modeValue)
              importNodeColour(store, importedNodes[j].nodeNumber, importedNodes[j].nodeColour, modeValue)
              importModulename(store, importedNodes[j].nodeNumber, importedNodes[j].moduleName, modeValue)
            }
          }
        }
        //
        if (workbook.SheetNames[i].toUpperCase() == "CHANNELS"){
          importedChannels = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])
          utils.timeStampedLog(logPrefix + "importSPREADSHEET: workbook number of Channels imported: " + importedChannels.length)
          for ( let j=0; j < importedChannels.length; j++) {
            if(importedChannels[j].channelNumber != undefined){
              utils.timeStampedLog(logPrefix + `importSPREADSHEET: workbook Channels: channel ${importedChannels[j].channelNumber} ${importedChannels[j].channelName}`)
              importChannelName(store, importedChannels[j].nodeNumber, importedChannels[j].channelNumber, importedChannels[j].channelName, modeValue)
            }
          }
        }
        //
        if (workbook.SheetNames[i].toUpperCase() == "NAMES"){
          importedUserNames = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]])
          utils.timeStampedLog(logPrefix + "importSPREADSHEET: workbook number of userNames imported: " + importedUserNames.length)
          for ( let j=0; j < importedUserNames.length; j++) {
            //utils.timeStampedLog(`importSPREADSHEET: NAMES: ${JSON.stringify(importedUserNames[j], null, " ")}`)
            importUserTokenName(
              store,
              importedUserNames[j].nodeNumber,
              importedUserNames[j].token,
              importedUserNames[j].number,
              importedUserNames[j].name,
              modeValue)
          }
        }
      }
    } else {
      throw new Error("Workbook undefined")
    }

  } catch (err){
    utils.timeStampedLog(logPrefix + ': importSPREADSHEET ' + err )
    store.eventBus.emit('GENERAL_MESSAGE_EVENT', "Spreadsheet import failed - check file is valid", err, 'warning', 0)
    throw err;
  }
}

//
//
function importEventName(store, eventNodeNumber, eventNumber, eventName, modeValue){
  if (eventNumber > 0){
    let eventIdentifier = decToHex(eventNodeNumber,4) + decToHex(eventNumber,4)
    if (store.state.layout.eventDetails[eventIdentifier] == undefined){
      // event doesn't exist
      store.setters.event_name(eventIdentifier, eventName)
      write_import_log(store,`importEventName: new event: ${eventIdentifier} eventName: ${eventName}`)
    } else if ((store.state.layout.eventDetails[eventIdentifier].name == undefined) ||
      (store.state.layout.eventDetails[eventIdentifier].name.length < 1)){
      // event name doesn't exist - but only update if import has value
      if ( (eventName != undefined)  && (eventName.length > 0) ){
        store.setters.event_name(eventIdentifier, eventName)
        write_import_log(store,`importEventName: event updated: ${eventIdentifier} eventName: ${eventName}`)
      }
    } else  if (store.state.layout.eventDetails[eventIdentifier].name == eventName) {
      write_import_log(store,`importEventName: event match: ${eventIdentifier} eventName: ${eventName}`)
      // do nothing
    } else {
      if (modeValue == "overwrite"){
        store.setters.event_name(eventIdentifier, eventName)
        write_import_log(store,`importEventName: event overwrite: ${eventIdentifier} eventName: ${eventName}`)
      } else {
        write_import_log(store,`importEventName: event retain: ${eventIdentifier}
          existing eventName: ${store.state.layout.eventDetails[eventIdentifier].name}`)
      }
    }
  }
}

//
//
function importEventGroup(store, eventNodeNumber, eventNumber, eventGroup, modeValue){
  if (eventNumber > 0){
    let eventIdentifier = decToHex(eventNodeNumber,4) + decToHex(eventNumber,4)
    if (store.state.layout.eventDetails[eventIdentifier] == undefined){
      // event doesn't exist
      store.setters.event_group(eventIdentifier, eventGroup)
      write_import_log(store,`importEventGroup: new event: ${eventIdentifier} eventGroup: ${eventGroup}`)
    } else if ((store.state.layout.eventDetails[eventIdentifier].group == undefined) ||
      (store.state.layout.eventDetails[eventIdentifier].group.length < 1)){
      // event group doesn't exist - but only update if import has value
      if ( (eventGroup != undefined)  && (eventGroup.length > 0) ){
        store.setters.event_group(eventIdentifier, eventGroup)
        write_import_log(store,`importEventGroup: event updated: ${eventIdentifier} eventGroup: ${eventGroup}`)
      }
    } else  if (store.state.layout.eventDetails[eventIdentifier].group == eventGroup) {
      write_import_log(store,`importEventGroup: event match: ${eventIdentifier} eventGroup: ${eventGroup}`)
      // do nothing
    } else {
      if (modeValue == "overwrite"){
        store.setters.event_group(eventIdentifier, eventGroup)
        write_import_log(store,`importEventGroup: event overwrite: ${eventIdentifier} eventGroup: ${eventGroup}`)
      } else {
        write_import_log(store,`importEventGroup: event retain: ${eventIdentifier}
          existing eventGroup: ${store.state.layout.eventDetails[eventIdentifier].group}`)
      }
    }
  }
}

//
//
function importEventColour(store, eventNodeNumber, eventNumber, eventColour, modeValue){
  if (eventNumber > 0){
    let eventIdentifier = decToHex(eventNodeNumber,4) + decToHex(eventNumber,4)
    if (store.state.layout.eventDetails[eventIdentifier] == undefined){
      // event doesn't exist
      store.setters.event_colour(eventIdentifier, eventColour)
      write_import_log(store,`importEventColour: new event: ${eventIdentifier} eventColour: ${eventColour}`)
    } else if ((store.state.layout.eventDetails[eventIdentifier].colour == undefined) ||
      (store.state.layout.eventDetails[eventIdentifier].colour.length < 1)){
      // event colour doesn't exist - but only update if import has value
      if ( (eventColour != undefined)  && (eventColour.length > 0) ){
        store.setters.event_colour(eventIdentifier, eventColour)
        write_import_log(store,`importEventColour: event updated: ${eventIdentifier} eventColour: ${eventColour}`)
      }
    } else  if (store.state.layout.eventDetails[eventIdentifier].colour == eventColour) {
      write_import_log(store,`importEventColour: event match: ${eventIdentifier} eventColour: ${eventColour}`)
      // do nothing
    } else {
      if (modeValue == "overwrite"){
        store.setters.event_colour(eventIdentifier, eventColour)
        write_import_log(store,`importEventColour: event overwrite: ${eventIdentifier} eventColour: ${eventColour}`)
      } else {
        write_import_log(store,`importEventColour: event retain: ${eventIdentifier}
          existing eventColour: ${store.state.layout.eventDetails[eventIdentifier].colour}`)
      }
    }
  }
}

//
//
function importNodeName(store, nodeNumber, nodeName, modeValue){
  // not interested in node 0, so skip
  if (nodeNumber > 0){
    if (store.state.layout.nodeDetails[nodeNumber] == undefined){
      // node doesn't exist, so create it with name
      store.setters.node_name(nodeNumber, nodeName)
      write_import_log(store,`importNodeName: new node: ${nodeNumber} nodeName: ${nodeName}`)
    } else if ((store.state.layout.nodeDetails[nodeNumber].name == undefined ) ||
      (store.state.layout.nodeDetails[nodeNumber].name.length < 1 )){
      // node not named, so name it - but only update if import has value
      if ( (nodeName != undefined)  && (nodeName.length > 0) ){
        store.setters.node_name(nodeNumber, nodeName)
        write_import_log(store,`importNodeName: node updated: ${nodeNumber} nodeName: ${nodeName}`)
      }
    } else if (store.state.layout.nodeDetails[nodeNumber].name == nodeName) {
      write_import_log(store,`importNodeName: node match: ${nodeNumber} nodeName: ${nodeName}`)
      // do nothing
    } else {
      // stored name doesn't match import name
      if (modeValue == "overwrite"){
        store.setters.node_name(nodeNumber, nodeName)
        write_import_log(store,`importNodeName: node overwrite: ${nodeNumber} nodeName: ${nodeName}`)
      } else {
        write_import_log(store,`importNodeName: node retain: ${nodeNumber}
          existing nodeName: ${store.state.layout.nodeDetails[nodeNumber].name}`)
      }
    }
  }
}

//
//
function importNodeGroup(store, nodeNumber, nodeGroup, modeValue){
  // not interested in node 0, so skip
  if (nodeNumber > 0){
    if (store.state.layout.nodeDetails[nodeNumber] == undefined){
      // node doesn't exist, so create it with group
      store.setters.node_group(nodeNumber, nodeGroup)
      write_import_log(store,`importNodeGroup: new node: ${nodeNumber} nodeGroup: ${nodeGroup}`)
    } else if ((store.state.layout.nodeDetails[nodeNumber].group == undefined ) ||
      (store.state.layout.nodeDetails[nodeNumber].group.length < 1 )){
      // no nodeGroup - but only update if import has value
      if ( (nodeGroup != undefined)  && (nodeGroup.length > 0) ){
        store.setters.node_group(nodeNumber, nodeGroup)
        write_import_log(store,`importNodeGroup: node updated: ${nodeNumber} nodeGroup: ${nodeGroup}`)
      }
    } else if (store.state.layout.nodeDetails[nodeNumber].group == nodeGroup) {
      utils.timeStampedLog('node ' + nodeNumber + ": nodeGroup: " + nodeGroup + ' match')
      write_import_log(store,`importNodeGroup: node match: ${nodeNumber} nodeGroup: ${nodeGroup}`)
      // do nothing
    } else {
      // stored name doesn't match import name
      if (modeValue == "overwrite"){
        write_import_log(store,`importNodeGroup: node overwrite: ${nodeNumber} nodeGroup: ${nodeGroup}`)
        store.setters.node_group(nodeNumber, nodeGroup)
      } else {
        write_import_log(store,`importNodeGroup: node retain: ${nodeNumber}
          existing nodeGroup: ${store.state.layout.nodeDetails[nodeNumber].group}`)
      }
    }
  }
}

//
//
function importNodeColour(store, nodeNumber, nodeColour, modeValue){
  // not interested in node 0, so skip
  if (nodeNumber > 0){
    if (store.state.layout.nodeDetails[nodeNumber] == undefined){
      // node doesn't exist, so create it with colour
      store.setters.node_colour(nodeNumber, nodeColour)
      write_import_log(store,`importNodeColour: new node: ${nodeNumber} nodeColour: ${nodeColour}`)
    } else if ((store.state.layout.nodeDetails[nodeNumber].colour == undefined ) ||
      (store.state.layout.nodeDetails[nodeNumber].colour.length < 1 )){
      // no nodeColour - but only update if import has value
      if ( (nodeColour != undefined)  && (nodeColour.length > 0) ){
        store.setters.node_colour(nodeNumber, nodeColour)
        write_import_log(store,`importNodeColour: node updated: ${nodeNumber} nodeColour: ${nodeColour}`)
      }
    } else if (store.state.layout.nodeDetails[nodeNumber].colour == nodeColour) {
      write_import_log(store,`importNodeColour: node match: ${nodeNumber} nodeColour: ${nodeColour}`)
      // do nothing
    } else {
      // stored colour doesn't match import colour
      if (modeValue == "overwrite"){
        write_import_log(store,`importNodeColour: node overwrite: ${nodeNumber} nodeColour: ${nodeColour}`)
        store.setters.node_colour(nodeNumber, nodeColour)
      } else {
        write_import_log(store,`importNodeColour: node retain: ${nodeNumber}
          existing nodeColour: ${store.state.layout.nodeDetails[nodeNumber].colour}`)
      }
    }
  }
}

//
//
function importModulename(store, nodeNumber, moduleName, modeValue){
  // not interested in node 0, so skip
  if (nodeNumber > 0){
    if (store.state.layout.nodeDetails[nodeNumber] == undefined){
      // node doesn't exist, so create it with moduleName
      store.setters.node_moduleName(nodeNumber, moduleName)
      write_import_log(store,`importModulename: new node: ${nodeNumber} moduleName: ${moduleName}`)
    } else if ((store.state.layout.nodeDetails[nodeNumber].moduleName == undefined ) ||
      (store.state.layout.nodeDetails[nodeNumber].moduleName.length < 1 )){
      // no moduleName - but only update if import has value
      if ( (moduleName != undefined)  && (moduleName.length > 0) ){
        store.setters.node_moduleName(nodeNumber, moduleName)
        write_import_log(store,`importModulename: node updated: ${nodeNumber} moduleName: ${moduleName}`)
      }
    } else if (store.state.layout.nodeDetails[nodeNumber].moduleName == moduleName) {
      write_import_log(store,`importModulename: node match: ${nodeNumber} moduleName: ${moduleName}`)
      // do nothing
    } else {
      // stored name doesn't match import name
      if (modeValue == "overwrite"){
        write_import_log(store,`importModulename: node overwrite: ${nodeNumber} moduleName: ${moduleName}`)
        store.setters.node_moduleName(nodeNumber, moduleName)
      } else {
        write_import_log(store,`importModulename: node retain: ${nodeNumber}
          existing moduleName: ${store.state.layout.nodeDetails[nodeNumber].moduleName}`)
      }
    }
  }
}

//
//
export function importChannelName(store, nodeNumber, channelNumber, channelName, modeValue){
  let existingChannelName = null
  try {
    existingChannelName= store.state.layout.nodeDetails[nodeNumber].tokens['channel'].userNames[channelNumber]
  } catch {}
  if ((existingChannelName == null) || (existingChannelName.length == 0)){
    // no channelName - but only update if import has value
    if ( (channelName != undefined)  && (channelName.length > 0) ){
      write_import_log(store,`importChannelName: node ${nodeNumber} channelName updated: ${channelName}`)
      store.setters.node_token_name(nodeNumber, 'channel', channelNumber, channelName)
    }
  } else if (existingChannelName == channelName){
    write_import_log(store,`importChannelName: node ${nodeNumber} channelName match: ${channelName}`)
  } else {
    // stored channel name doesn't match import channel name
    if (modeValue == "overwrite"){
      write_import_log(store,`importChannelName: node ${nodeNumber} channelName overwrite: ${channelName}`)
      store.setters.node_token_name(nodeNumber, 'channel', channelNumber, channelName)
    } else {
      write_import_log(store,`importChannelName: node ${nodeNumber} channelName retain:
        existing channelName ${existingChannelName}`)
    }
  }
}

//
//
export function importUserTokenName(store, nodeNumber, tokenName, tokenNumber, userName, modeValue){
  if (userName != undefined){
    if (userName.length >0){
      utils.timeStampedLog(`addNodeUserName:
        ${tokenName}
        ${tokenNumber}
        ${userName}
        ${modeValue}`)

      let existingUserName = null
      try {
        // check if layout data has an existing name
        existingUserName= store.state.layout.nodeDetails[nodeNumber].tokens[tokenName].userNames[tokenNumber]
      } catch {}
      if ((existingUserName == null) || (existingUserName.length == 0)){
        // no userName - but only update if import has value
        if ( (userName != undefined)  && (userName.length > 0) ){
          write_import_log(store,`importUserTokenName: node ${nodeNumber} updated: token: ${tokenName}${tokenNumber} userName: ${userName}`)
          store.setters.node_token_name(nodeNumber, tokenName, tokenNumber, userName)
        }
      } else if (existingUserName == userName){
        write_import_log(store,`importUserTokenName: node ${nodeNumber} match: token: ${tokenName}${tokenNumber} userName: ${userName}`)
      } else {
        //utils.timeStampedLog(`node: ${nodeNumber} token: ${tokenName}${tokenNumber} existingUserName ${existingUserName} length ${existingUserName.length}`)
        // stored channel name doesn't match import channel name
        if (modeValue == "overwrite"){
          write_import_log(store,`importUserTokenName: node ${nodeNumber} overwrite: token: ${tokenName}${tokenNumber} userName: ${userName}`)
          store.setters.node_token_name(nodeNumber, tokenName, tokenNumber, userName)
        } else {
          write_import_log(store,`importUserTokenName: node ${nodeNumber} retain: token: ${tokenName}${tokenNumber}
            existing userName: ${existingUserName}`)
        }
      }

    }
  }
}

