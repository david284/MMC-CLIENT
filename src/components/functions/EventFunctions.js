
import {inject} from "vue";
import * as utils from "components/functions/utils.js"

const name = "EventFunctions"

export function  getEventCount (nodeNumber, store) {
  console.log (name + " getEventList " + nodeNumber)
  var count = Object.keys(getEventslist(nodeNumber, store)).length
  console.log (name + " getEventList - count " + count)
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
  console.log (name + ": refreshEventIndexes: Node " + nodeNumber)
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
  console.log(name + JSON.stringify(eventsList))
  return eventsList
}

//
//
export function createNewEvent (store, nodeNumber, eventIdentifier) {
  console.log(name + `: createNewEvent: ${nodeNumber} : ${eventIdentifier}`)
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
    console.log(name + `: createNewEvent: event already exists ${nodeNumber} : ${eventIdentifier}`)
  }
  return result
}

//
// checks if cbus message is an ON or OFF event
//
export function getEventType (cbusMsg) {
  utils.timeStampedLog(name + ': getEventType : opcode ' + cbusMsg.opCode)
  let result = undefined
  let opCode = cbusMsg.opCode
  if (
    (opCode == '90')
    || (opCode == '98')
    || (opCode == 'B0')
    || (opCode == 'B8')
    || (opCode == 'D0')
    || (opCode == 'D8')
    || (opCode == 'F0')
    || (opCode == 'F8')
  ){
    result = {"type":"ON"}
  }
  else if(
    (opCode == '91')
    || (opCode == '99')
    || (opCode == 'B1')
    || (opCode == 'B9')
    || (opCode == 'D1')
    || (opCode == 'D9')
    || (opCode == 'F1')
    || (opCode == 'F9')
  ){
    result = {"type":"OFF"}
  }
  return result
}
