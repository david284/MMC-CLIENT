
import {inject} from "vue";
import * as utils from "components/functions/utils.js"
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"

const name = "EventFunctions"

export function  getEventCount (nodeNumber, store) {
  utils.timeStampedLog (name + " getEventList " + nodeNumber)
  var count = Object.keys(getEventslist(nodeNumber, store)).length
  utils.timeStampedLog (name + " getEventList - count " + count)
  return count
}

//
// always call this with the 'await' prefix
// this ensures the function can use sleep
// we want to try to ensure the indexes have been updated before we
// issue any other event read commands
//
export async function refreshEventIndexes (store, nodeNumber, eventIdentifier) {
  // request all node events in advance of loading events as it refreshes the indexes
  utils.timeStampedLog (name + ": refreshEventIndexes: Node " + nodeNumber)
  store.methods.request_all_node_events(nodeNumber)
}

//
//
const getEventslist = (nodeNumber, store) => {
  var eventsList = []

  // do stored events for this node first.....
  var events = Object.values(store.state.nodes[nodeNumber].storedEventsNI)
  events.forEach(event => {
    var eventNodeNumber = parseInt(event.eventIdentifier.substr(0, 4), 16)
    let output = {}
    output['eventIdentifier'] = event.eventIdentifier
//    output['eventName'] = store.getters.event_name(event.eventIdentifier)
    output['eventIndex'] = event.eventIndex
    output['nodeNumber'] = eventNodeNumber
    output['eventNumber'] = parseInt(event.eventIdentifier.substr(4, 4), 16)
//    output['eventType'] = getEventType(event.eventIndex)
    output['storedEvent'] = true
    eventsList.push(output)
  })

  // now add bus events... but not if already in the list
  var busEvents = Object.values(store.state.busEvents)
  busEvents.forEach(busEvent => {
    if (busEvent.nodeNumber == nodeNumber){
      // lets see if it's already in the stored events...
      var alreadyInList = false
      events.forEach(event => {
        if(busEvent.id == event.eventIdentifier){
          alreadyInList = true
        }
      })
      if (alreadyInList == false){
        let output = {}
        output['eventIdentifier'] = busEvent.id
//        output['eventName'] = store.getters.event_name(busEvent.id)
        output['nodeNumber'] = busEvent.nodeNumber
        output['eventNumber'] = busEvent.eventNumber
        output['storedEvent'] = false
        eventsList.push(output)
      }
    }
  })

  // sort rows by eventIdentifier, not eventIndex
  eventsList.sort(function(a, b){return (a.eventIdentifier < b.eventIdentifier)? -1 : 1;});
  utils.timeStampedLog(name + JSON.stringify(eventsList))
  return eventsList
}

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
        "node": nodeNumber,
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
// checks if cbus message is an ON or OFF event
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
// checks if cbus message is an ON or OFF event
//
export function requestAllEventsByIndex (store, nodeNumber) {
  //utils.timeStampedLog(name + `: requestAllEventsByIndex: nodeNumber ${nodeNumber}`)
  try{
    let numberOfEvents = store.getters.node_descriptor_numberOfEvents(nodeNumber)
    // will return 0 if descriptor doesn't have numberOfEvents defined
    if(numberOfEvents == 0){
      // param 4 is number of events supported
      numberOfEvents = store.state.nodes[nodeNumber].parameters[4]
    }
    // always request at least 8
    if((numberOfEvents < 8 ) || (numberOfEvents == undefined)){ numberOfEvents = 8 }
    //utils.timeStampedLog(name + `: requestAllEventsByIndex: numberOfEvents ${numberOfEvents}`)
    store.methods.request_all_node_events_by_index(nodeNumber, numberOfEvents)
    return numberOfEvents   // for unit test
  } catch (err){
    utils.timeStampedLog(name + `: requestAllEventsByIndex ${err}`)
  }
}


export function eventTeach (
  store,
  nodeNumber,
  eventIdentifier,
  eventIndex,
  eventVariableIndex,
  eventVariableValue,
  configuration) {
  if (store.getters.node_descriptor_useEventIndex(nodeNumber) == true){
    // use eventIndex
    store.methods.event_teach_by_index(
      nodeNumber,
      eventIndex,
      eventVariableIndex,
      eventVariableValue,
      true,
      getLinkedEventVariables(configuration)
    )
  } else {
    // use eventIdentifier
    store.methods.event_teach_by_identifier(
      nodeNumber,
      eventIdentifier,
      eventVariableIndex,
      eventVariableValue,
      true,
      getLinkedEventVariables(configuration)
    )
  }
}
