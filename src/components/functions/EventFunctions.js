
import {inject} from "vue";
import * as utils from "components/functions/utils.js"
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"

const name = "EventFunctions"


//
//
export function createNewEvent (store, nodeNumber, eventIdentifier) {
  utils.timeStampedLog(name + `: createNewEvent: ${nodeNumber} : ${eventIdentifier}`)
  var result = false
  // lets create a shortcut to the node entry for readability
  var nodeEntry = store.state.nodes[nodeNumber]
  // check it doesn't already exist
  if (nodeEntry.storedEventsNI[eventIdentifier] == undefined){
    // create temporary event entry in storedEventNI table (will be overwritten when module read after teach)
    nodeEntry.storedEventsNI[eventIdentifier] = {
        "eventIdentifier": eventIdentifier,
        "eventIndex": 1,
        "variables": {}
    }
    nodeEntry.storedEventsNI[eventIdentifier].variables[0] = nodeEntry.parameters[5]
    for (var i = 1; i<= nodeEntry.parameters[5]; i++){
      nodeEntry.storedEventsNI[eventIdentifier].variables[i] = 0
    }
    result = true
  } else {
    utils.timeStampedLog(name + `: createNewEvent: event already exists ${nodeNumber} : ${eventIdentifier}`)
  }
  return result
}

//
// checks if cbus message is an ON or OFF accessory event
// and long or short
//
export function getEventDetails (cbusMsg) {
  utils.timeStampedLog(name + ': getEventDetails : opcode ' + cbusMsg.opCode)
  let result = {"type":undefined,"state":undefined, }
  let opCode = cbusMsg.opCode
  if (
    (opCode == '90')
    || (opCode == 'B0')
    || (opCode == 'D0')
    || (opCode == 'F0')
  ){
    result.type = "LONG"
    result.state = "ON"
  }
  else if (
    (opCode == '98')
    || (opCode == 'B8')
    || (opCode == 'D8')
    || (opCode == 'F8')
  ){
    result.type = "SHORT"
    result.state = "ON"
  }
  else if(
    (opCode == '91')
    || (opCode == 'B1')
    || (opCode == 'D1')
    || (opCode == 'F1')
  ){
    result.type = "LONG"
    result.state = "OFF"
  }
  else if(
     (opCode == '99')
    || (opCode == 'B9')
    || (opCode == 'D9')
    || (opCode == 'F9')
  ){
    result.type = "SHORT"
    result.state = "OFF"
  }
  return result
}

//
// requests all events
// needs to decide if it's individual by index (NENRD)
// or single NERD command
//
export function requestAllNodeEvents (store, nodeNumber) {
  if (store.getters.node_useNENRD(nodeNumber)) {
    requestAllEventsByNENRD(store, nodeNumber)
  } else {
    store.methods.request_all_node_events(nodeNumber)
  }
}

//
// requests all events using indexes
// needs to supply the number of events
//
export function requestAllEventsByNENRD (store, nodeNumber) {
  try{
    let numberOfEvents = store.getters.node_numberOfEvents(nodeNumber)
    utils.timeStampedLog(name + `: requestAllEventsByNENRD: nodeNumber ${nodeNumber} count ${numberOfEvents}`)
    store.methods.request_all_node_events_by_index(nodeNumber, numberOfEvents)
    return numberOfEvents   // for unit test
  } catch (err){
    utils.timeStampedLog(name + `: requestAllEventsByNENRD ${err}`)
  }
}

//
//
//
export async function deleteAllEvents (store, nodeNumber){
  try{
    store.methods.delete_all_events(nodeNumber)
    await utils.sleep(500)
    if (store.getters.node_useNENRD(nodeNumber) == true){
      requestAllEventsByNENRD(store, nodeNumber)
    }
  } catch (err){
    utils.timeStampedLog (name + `: deleteAllEvents ${err} `)
  }
}

//
//
//
export async function eventDelete (
  store,
  nodeNumber,
  eventIdentifier,
  eventIndex
){
  try{
    utils.timeStampedLog (name + `: eventDelete ${nodeNumber} ${eventIdentifier} ${eventIndex} `)
    if (store.getters.node_useEventIndex(nodeNumber) == true){
      // use eventIndex
      if (eventIndex != undefined){
        let newEventIdentifier = utils.decToHex(nodeNumber, 4) + utils.decToHex(eventIndex, 4)
        if(store.state.nodes[nodeNumber].VLCB == true){
          newEventIdentifier = "00000000"
        }
        store.methods.event_teach_by_index(
          nodeNumber,
          newEventIdentifier,
          eventIndex,
          0,
          0,
          false
          // don't need linked variables as we're just changing the event identifier
        )
      }
      await utils.sleep(500)
      requestAllNodeEvents(store, nodeNumber)
    } else {
      // use eventIdentifier - this does a refresh anyway
      store.methods.remove_event(nodeNumber, eventIdentifier, eventIndex)
    }
    try{
      // remove from indexedEvents (it if exists)
      delete store.state.layout.nodeDetails[nodeNumber].indexedEvents[eventIndex]
    } catch (err){
      //utils.timeStampedLog (name + `: eventDelete: indexedEvents Delete ${err} `)
    }
  } catch (err) {
    utils.timeStampedLog (name + `: eventDelete ${err} `)
  }
}

export function eventTeach (
  store,
  nodeNumber,
  eventIdentifier,
  eventIndex,
  eventVariableIndex,
  eventVariableValue,
  reLoad,
  configuration) {
  if (store.getters.node_useEventIndex(nodeNumber) == true){
    // use eventIndex
    store.methods.event_teach_by_index(
      nodeNumber,
      eventIdentifier,
      eventIndex,
      eventVariableIndex,
      eventVariableValue,
      reLoad,
      getLinkedEventVariables(configuration)
    )
    return "index"
  } else {
    // use eventIdentifier
    store.methods.event_teach_by_identifier(
      nodeNumber,
      eventIdentifier,
      eventVariableIndex,
      eventVariableValue,
      reLoad,
      getLinkedEventVariables(configuration)
    )
    return "identifier"
  }
}

export function getEventVariable (
  store,
  nodeNumber,
  eventIdentifier,
  eventIndex,
  eventVariableIndex)
{
  try {
    if (store.getters.node_useEventIndex(nodeNumber) == true){
      // use eventIndex
        return store.getters.event_variable_by_index(nodeNumber, eventIndex, eventVariableIndex)
    } else {
        return store.getters.event_variable_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex)
    }
  } catch (err){
    utils.timeStampedLog(name + `: getEventVariable: ${err}`)
  }
}

//
// Takes array of event variables for a single event in a specific node
// it expects both the event identifier and event index
// And calls the generic eventTeach method, which works out which teaching method to use
//
export async function restoreEventVariables (store, nodeNumber, eventIdentifier, eventIndex, eventVariables) {
  utils.timeStampedLog(name + `: restoreEventVariables: node ${nodeNumber} ${eventIdentifier} ${eventIndex}`)
  try{
    // ensure variables are restored in ascending index order
    for (let index of Object.keys(eventVariables).sort(function(a, b){return a - b})) {
      if (index > 0)
      {
        let variable = eventVariables[index]
        utils.timeStampedLog(name + `: restoreEventVariables: ${index} ${variable}` )
        let reLoad = false  // don't reLoad variables after teaching
        eventTeach(
          store,
          nodeNumber,
          eventIdentifier,
          eventIndex,
          index,
          variable,
          reLoad)
        await utils.sleep(100)  // allow a little time between requests
      }
    }
    return true
  } catch (err){
    utils.timeStampedLog(name + ': restoreEventVariables: ' + err)
    return false
  }
}
