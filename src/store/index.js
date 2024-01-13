import {reactive} from 'vue'
import io from 'socket.io-client'
//import VueSocketIO from 'vue-socket.io'

const host = window.location.hostname
const port = "5552"

const state = reactive({
  version: {},
  nodes: {},
  nodeDescriptors: {},
  nodeTraffic: [],
  events: {},
  cbus_errors: {},
  dcc_sessions: {},
  dcc_errors: {},
  layout: {},
  layouts_list: [],
  display_component: "layout",
  events_component: "DefaultEventsList",
  services_component: "Default2NodeServicesList",
  selected_node: 0,
  selected_event_index: 0,
  selected_service_index: 0,
  title: "MMC",
  debug: false,
  advanced: false,
  develop: false,
  colours: ["black", "red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "blue-grey", "grey"]
})

const methods = {
  long_on_event(nodeNumber, eventNumber){
    console.log(`ACON ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_LONG_ON', {
      "nodeNumber": nodeNumber,
      "eventNumber": eventNumber
    })
  },
  long_off_event(nodeNumber, eventNumber){
    console.log(`ACOF ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_LONG_OFF', {
      "nodeNumber": nodeNumber,
      "eventNumber": eventNumber
    })
  },
  short_on_event(nodeNumber, eventNumber){
    console.log(`ASON ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_ON', {
      "nodeNumber": 0,
      "deviceNumber": eventNumber
    })
  },
  short_off_event(nodeNumber, eventNumber){
    console.log(`ACOF ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_OFF', {
      "nodeNumber": 0,
      "deviceNumber": eventNumber
    })
  },
  remove_node(nodeNumber) {
    socket.emit('REMOVE_NODE', {"nodeId": nodeNumber})
  },
  update_layout() {
    console.log(`Update Layout Details : ` + state.title)
    socket.emit('UPDATE_LAYOUT_DETAILS', state.layout)
  },
  request_service_discovery(nodeNumber) {
    console.log(`Request Service Discovery : ` + nodeNumber)
    socket.emit('REQUEST_SERVICE_DISCOVERY', {"nodeId":nodeNumber})
  },
  request_diagnostics(nodeNumber, serviceIndex) {
    if (serviceIndex == undefined){serviceIndex = 0;}
    console.log(`Request Service Diagnostics : node ` + nodeNumber + ' Service Index ' + serviceIndex )
    socket.emit('REQUEST_DIAGNOSTICS', {"nodeId":nodeNumber, "serviceIndex":serviceIndex})
  },
  update_node_variable(nodeNumber, nodeVariableIndex, nodeVariableValue) {
    state.nodes[nodeNumber].nodeVariables[nodeVariableIndex] = nodeVariableValue
    
    console.log(`NVsetNeedsLearnMode : ` + JSON.stringify(state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode))
    if((state.nodeDescriptors[nodeNumber])
        && (state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode)){
          console.log(`MAIN Update Node Variable in learn mode : `+nodeNumber+' : '+nodeVariableIndex+' : '+  nodeVariableValue)
          socket.emit('UPDATE_NODE_VARIABLE_IN_LEARN_MODE', {
        "nodeId": nodeNumber,
        "variableId": nodeVariableIndex,
        "variableValue": parseInt(nodeVariableValue)
      })
    } else {
      console.log(`MAIN Update Node Variable : `+nodeNumber+' : '+nodeVariableIndex+' : '+  nodeVariableValue)
      socket.emit('UPDATE_NODE_VARIABLE', {
        "nodeId": nodeNumber,
        "variableId": nodeVariableIndex,
        "variableValue": parseInt(nodeVariableValue)
       })
    }
  },
  update_node_variable_in_learn_mode(nodeNumber, nodeVariableIndex, nodeVariableValue) {
    console.log(`MAIN Update Node Variable in Learn Mode:`+nodeNumber+' : '+nodeVariableIndex+' : '+  nodeVariableValue)
    state.nodes[nodeNumber].nodeVariables[nodeVariableIndex] = nodeVariableValue
    //if (nodeVariableValue !="" ) {
      socket.emit('UPDATE_NODE_VARIABLE_IN_LEARN_MODE', {
        "nodeId": nodeNumber,
        "variableId": nodeVariableIndex,
        "variableValue": parseInt(nodeVariableValue)
      })
    //}
  },
  update_event_variable(nodeNumber, eventName, eventIndex, eventVariableIndex, eventVariableValue) {
    console.log(`MAIN Update Event Variable : ${eventIndex} : ${eventVariableIndex} : ${eventVariableValue} `)
    state.nodes[nodeNumber].storedEvents[eventIndex].variables[eventVariableIndex] = eventVariableValue
    socket.emit('UPDATE_EVENT_VARIABLE',{
      "nodeId": nodeNumber,
      "eventName": eventName,
      "eventIndex": eventIndex,
      "eventVariableId": eventVariableIndex,
      "eventVariableValue": parseInt(eventVariableValue)
    })
  },
  remove_event(nodeNumber, eventName) {
    socket.emit('REMOVE_EVENT', {
        "nodeId": nodeNumber,
        "eventName": eventName
    })
  },
  teach_event(nodeNumber, eventName, eventIndex) {
    socket.emit('TEACH_EVENT', {
      "nodeId": nodeNumber,
      "eventName": eventName,
      "eventIndex": eventIndex
    })
  },
  update_display_component(component) {
    state.display_component = component
  },
  update_event_component(component) {
    state.events_component = component
  },
  update_services_component(component) {
    state.services_component = component
  },
  QNN() {
    console.log(`QUERY_ALL_NODES`)
    socket.emit('QUERY_ALL_NODES')
  },
  clear_events() {
    socket.emit('CLEAR_EVENTS')
    console.log(`CLEAR_EVENTS`)
  },
  clear_cbus_errors() {
    socket.emit('CLEAR_CBUS_ERRORS')
    console.log(`CLEAR_CBUS_ERRORS`)
  },
  refresh_events() {
    socket.emit('REFRESH_EVENTS')
    console.log(`REFRESH_EVENTS`)
  },
  request_all_node_parameters(nodeId, parameters, delay) {
    socket.emit('REQUEST_ALL_NODE_PARAMETERS', {"nodeId": nodeId, "parameters": parameters, "delay": delay})
    console.log(`REQUEST_ALL_NODE_PARAMETERS`)
  },
  request_node_parameter(nodeId, parameter) {
    socket.emit('RQNPN', {"nodeId": nodeId, "parameter": parameter})
  },
  request_all_node_variables(nodeId, variables, delay, start) {
    socket.emit('REQUEST_ALL_NODE_VARIABLES', {
      "nodeId": nodeId,
      "variables": variables,
      "delay": delay,
      "start": start
    })
    console.log(`REQUEST_ALL_NODE_VARIABLES`)
  },
  request_node_variable(nodeId, variable) {
    socket.emit('REQUEST_NODE_VARIABLE', {
      "nodeId": nodeId,
      "variableId": variable,
    })
  },
  request_all_node_events(nodeId) {
    socket.emit('REQUEST_ALL_NODE_EVENTS', {"nodeId": nodeId})
    console.log(`REQUEST_ALL_NODE_EVENTS`)
  },
  request_all_event_variables(nodeId, eventIndex, delay, variables) {
    console.log(`REQUEST_ALL_EVENT_VARIABLES: eventIndex ` + eventIndex)
    socket.emit('REQUEST_ALL_EVENT_VARIABLES', {
      "nodeId": nodeId,
      "eventIndex": eventIndex,
      "variables": variables,
      "delay": delay
    })
  },
  request_event_variable(nodeId, eventIndex, eventVariableId){
    console.log(`REQUEST_EVENT_VARIABLE ${eventIndex} ${eventVariableId}`)
    socket.emit('REQUEST_EVENT_VARIABLE', {
      "nodeId": nodeId,
      "eventIndex": eventIndex,
      "eventVariableId": eventVariableId
    })
  },
  clear_node_events(nodeId) {
    console.log(`CLEAR_NODE_EVENTS ${nodeId}`)
    socket.emit('CLEAR_NODE_EVENTS',{
      "nodeId": nodeId
    })
  },
  STOP_SERVER(nodeId) {
    socket.emit('STOP_SERVER')
    console.log(`STOP SERVER`)
    window.close()
  },
  request_version(){
    socket.emit('REQUEST_VERSION')
  },
  request_layout_list(){
    socket.emit('REQUEST_LAYOUTS_LIST')
  },
  change_layout(data){
    console.log(`CHANGE_LAYOUT`)
    socket.emit('CHANGE_LAYOUT', data)
  }
}

const getters = {
  event_name(eventId) {
    if (eventId in state.layout.eventDetails) {
      //console.log(`Event Name`)
      return state.layout.eventDetails[eventId].name
    } else {
      //console.log(`Event No Name ${JSON.stringify(eventId)}`)
      return JSON.stringify(eventId)
    }
  },
  event_colour(eventId) {
    if (eventId in state.layout.eventDetails) {
      //console.log(`Event Name`)
      return state.layout.eventDetails[eventId].colour
    } else {
      //console.log(`Event No Name ${JSON.stringify(eventId)}`)
      return "black"
    }
  },
  event_group(eventId) {
    if (eventId in state.layout.eventDetails) {
      //console.log(`Event Name`)
      return state.layout.eventDetails[eventId].group
    } else {
      //console.log(`Event No Name ${JSON.stringify(eventId)}`)
      return ""
    }
  }
}

const setters = {
  event_name(eventIdentifier, eventName) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
    state.layout.eventDetails[eventIdentifier].name = eventName
    methods.update_layout()
  }
}

const socket = io(`http://${host}:${port}`)

socket.on("connect", () => {
  console.log(`Socket Connect`)
  socket.emit('REQUEST_VERSION')
  socket.emit('REQUEST_LAYOUTS_LIST')
})

socket.on("CBUS_ERRORS", (data) => {
  console.log(`RECEIVED CBUS_ERRORS `)
  state.cbus_errors = data
})

socket.on("CBUS_NO_SUPPORT", (data) => {
  console.log(`RECEIVED CBUS_NO_SUPPORT `)
})

socket.on("CBUS_TRAFFIC", (data) => {
//  console.log(`RECEIVED CBUS_TRAFFIC`)
  state.nodeTraffic.push(data)
  if (state.nodeTraffic.length > 10) {
    state.nodeTraffic.shift()
  }
})

socket.on("DCC_ERROR", (data) => {
  console.log(`RECEIVED DCC_ERROR`)
  state.dcc_errors = data
})

socket.on('DCC_SESSIONS', function (data) {
  console.log(`RECEIVED DCC_SESSIONS`)
  // console.log(`CBUS Errors Received:${JSON.stringify(data)}`)
  state.dcc_sessions = data;
})

socket.on("EVENTS", (data) => {
  console.log(`RECEIVED Events Data`)
  state.events = data
})

socket.on('LAYOUT_DETAILS', (data) => {
  console.log(`RECEIVED Layout Details`)
  state.layout = data;
})

socket.on('LAYOUTS_LIST', (data) => {
  console.log(`RECEIVED Layouts list`)
  state.layouts_list = data;
})

socket.on("NODE", (data) => {
  console.log(`RECEIVED NODE : ${data.nodeNumber} Data`)
  state.nodes[data.nodeNumber] = data
})

socket.on("NODES", (data) => {
  console.log(`RECEIVED NODES`)
  state.nodes = data
})

socket.on("NODE_DESCRIPTOR", (data) => {
  var nodeNumber = Object.keys(data)[0]   // get first key
  console.log(`RECEIVED NODE_DESCRIPTOR : node ` + nodeNumber)
  state.nodeDescriptors[nodeNumber] = Object.values(data)[0]    // get first value
})

socket.on('dccSessions', function (data) {
  console.log(`RECEIVED DCC Sessions`)
  // console.log(`CBUS Errors Received:${JSON.stringify(data)}`)
  state.dcc_sessions = data;
})

socket.on("VERSION", (data) => {
  console.log(`RECEIVED VERSION ` + JSON.stringify(data))
  state.version = data
})

export default {
  state,
  methods,
  getters,
  setters
}
