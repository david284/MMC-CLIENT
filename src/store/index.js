import {reactive} from 'vue'
import io from 'socket.io-client'
//import VueSocketIO from 'vue-socket.io'
import { EventBus } from 'quasar'
import {NodeParameterNames} from "src/definitions/Text_NodeParameterNames"

const eventBus = new EventBus()
const host = window.location.hostname
const port = "5552"
const name = "store"

const state = reactive({
  backups_list: [],
  busEvents: {},
  cbus_errors: {},
  colours: ["black", "red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "blue-grey", "grey"],
  dcc_sessions: {},
  dcc_errors: {},
  develop: false,
  event_view_status: [],
  inStartup: true,
  layout: {},
  layouts_list: [],
  loadFile_notification_raised: {},
  nodeDescriptors: {},
  nodeDescriptorList: {},
  nodes: {},
  nodeTraffic: [],
  selected_node: 0,
  title: "MMC",
//  debug: false,
//  advanced: false,
  update_layout_needed: false,
  version: {}
})

//-----------------------------------------------------------------------------
//  Methods
//-----------------------------------------------------------------------------
const methods = {
  change_layout(data){
    console.log(name + `: CHANGE_LAYOUT: ` + JSON.stringify(data))
    socket.emit('CHANGE_LAYOUT', data)
  },
  clear_bus_events() {
    socket.emit('CLEAR_BUS_EVENTS')
    console.log(name + `: CLEAR_BUS_EVENTS`)
  },
  clear_cbus_errors() {
    socket.emit('CLEAR_CBUS_ERRORS')
    console.log(`CLEAR_CBUS_ERRORS`)
  },
  clear_node_events(nodeNumber) {
    console.log(`CLEAR_NODE_EVENTS ${nodeNumber}`)
    socket.emit('CLEAR_NODE_EVENTS',{
      "nodeNumber": nodeNumber
    })
  },

  delete_all_events(nodeNumber) {
    socket.emit('DELETE_ALL_EVENTS', {
        "nodeNumber": nodeNumber
    })
    console.log(name + `: DELETE_ALL_EVENTS ${nodeNumber}`)
  },
  delete_layout(layoutName) {
    socket.emit('DELETE_LAYOUT', {
        "layoutName": layoutName
    })
    console.log(name + `: DELETE_LAYOUT ${layoutName}`)
  },

  event_teach_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex, eventVariableValue){
    console.log(name + `: event_teach_by_identifier : ${nodeNumber} : ${eventIdentifier} : ${eventVariableIndex} : ${eventVariableValue} `)
    socket.emit('EVENT_TEACH_BY_IDENTIFIER',{
      "nodeNumber": nodeNumber,
      "eventIdentifier": eventIdentifier,
      "eventVariableIndex": eventVariableIndex,
      "eventVariableValue": parseInt(eventVariableValue)
    })
  },

  import_module_descriptor(moduleDescriptor) {
    console.log(`import_module_descriptor : ` + moduleDescriptor.moduleDescriptorFilename)
    socket.emit('IMPORT_MODULE_DESCRIPTOR', moduleDescriptor)
  },

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

  node_can_id_enum(nodeNumber){
    console.log(name + `: CANID_ENUM : ` + nodeNumber)
    socket.emit('CANID_ENUM', nodeNumber)
  },

  program_node(nodeNumber, cpuType, flags, hexFile) {
    console.log(name + `: PROGRAM_NODE : ` + nodeNumber)
    socket.emit('PROGRAM_NODE', {
      "nodeNumber": nodeNumber,
      "cpuType": cpuType,
      "flags": flags,
      "hexFile": hexFile
    })
  },

  query_all_nodes() {
    console.log(`QUERY_ALL_NODES`)
    socket.emit('QUERY_ALL_NODES')
  },

  remove_node(nodeNumber) {
    socket.emit('REMOVE_NODE', nodeNumber)
    console.log(name + ': sent REMOVE_NODE ' + nodeNumber)
  },
  request_backups_list(layoutName) {
    console.log(`request_backups_list : ` + layoutName)
    socket.emit('REQUEST_BACKUPS_LIST', {"layoutName":layoutName})
  },
  request_service_discovery(nodeNumber) {
    console.log(`Request Service Discovery : ` + nodeNumber)
    socket.emit('REQUEST_SERVICE_DISCOVERY', {"nodeNumber":nodeNumber})
  },
  request_diagnostics(nodeNumber, serviceIndex) {
    if (serviceIndex == undefined){serviceIndex = 0;}
    console.log(`Request Service Diagnostics : node ` + nodeNumber + ' Service Index ' + serviceIndex )
    socket.emit('REQUEST_DIAGNOSTICS', {"nodeNumber":nodeNumber, "serviceIndex":serviceIndex})
  },
  remove_event(nodeNumber, eventName) {
    socket.emit('REMOVE_EVENT', {
        "nodeNumber": nodeNumber,
        "eventName": eventName
    })
  },
  request_all_node_parameters(nodeNumber, parameters, delay) {
    socket.emit('REQUEST_ALL_NODE_PARAMETERS', {"nodeNumber": nodeNumber, "parameters": parameters, "delay": delay})
    console.log(`REQUEST_ALL_NODE_PARAMETERS`)
  },
  request_node_parameter(nodeNumber, parameter) {
    socket.emit('RQNPN', {"nodeNumber": nodeNumber, "parameter": parameter})
  },
  request_all_node_variables(nodeNumber, variables, delay, start) {
    socket.emit('REQUEST_ALL_NODE_VARIABLES', {
      "nodeNumber": nodeNumber,
      "variables": variables,
      "delay": delay,
      "start": start
    })
    console.log(`REQUEST_ALL_NODE_VARIABLES`)
  },
  refresh_bus_events() {
    socket.emit('REQUEST_BUS_EVENTS')
    console.log(name + `: REQUEST_BUS_EVENTS`)
  },
  request_node_variable(nodeNumber, variable) {
    socket.emit('REQUEST_NODE_VARIABLE', {
      "nodeNumber": nodeNumber,
      "variableId": variable,
    })
  },
  request_all_node_events(nodeNumber) {
    socket.emit('REQUEST_ALL_NODE_EVENTS', {"nodeNumber": nodeNumber})
    console.log(`REQUEST_ALL_NODE_EVENTS`)
  },
  request_all_event_variables(nodeNumber, eventIndex, delay, variables) {
    console.log(name + `: REQUEST_ALL_EVENT_VARIABLES: nodeNumber: ` + nodeNumber + ` eventIndex: ` + eventIndex)
    socket.emit('REQUEST_ALL_EVENT_VARIABLES', {
      "nodeNumber": nodeNumber,
      "eventIndex": eventIndex,
      "variables": variables,
      "delay": delay
    })
  },
  request_event_variables_by_identifier(nodeNumber, eventIdentifier) {
    console.log(name + `: REQUEST_EVENT_VARIABLES_BY_IDENTIFIER: nodeNumber: ` + nodeNumber + ` eventIdentifier: ` + eventIdentifier)
    socket.emit('REQUEST_ALL_EVENT_VARIABLES', {
      "nodeNumber": nodeNumber,
      "eventIdentifier": eventIdentifier
    })
  },
  request_event_variable(nodeNumber, eventIndex, eventVariableId){
    console.log(`REQUEST_EVENT_VARIABLE ${eventIndex} ${eventVariableId}`)
    socket.emit('REQUEST_EVENT_VARIABLE', {
      "nodeNumber": nodeNumber,
      "eventIndex": eventIndex,
      "eventVariableId": eventVariableId
    })
  },
  request_bus_connection() {
//    console.log(name + `: REQUEST_BUS_CONNECTION`)
    socket.emit('REQUEST_BUS_CONNECTION')
  },
  request_status(){
    socket.emit('REQUEST_STATUS')
  },
  request_version(){
    socket.emit('REQUEST_VERSION')
  },
  request_layout_list(){
    console.log(name + `: request_layout_list:`)
    socket.emit('REQUEST_LAYOUTS_LIST')
  },
  reset_node(nodeNumber) {
    socket.emit('RESET_NODE', nodeNumber)
    console.log(name + ': RESET_NODE ' + nodeNumber)
  },

  save_backup(data){
    console.log(`SAVE_BACKUP`)
    data['layoutName'] = state.layout.layoutDetails.title
    socket.emit('SAVE_BACKUP', data)
  },
  set_can_id(nodeNumber, CAN_ID){
    var data = {}
    data['nodeNumber'] = nodeNumber
    data['CAN_ID'] = CAN_ID    
    socket.emit('SET_CAN_ID', data)
    console.log(name + `: SET_CAN_ID: node ` + JSON.stringify(data))
  },
  STOP_SERVER(nodeNumber) {
    socket.emit('STOP_SERVER')
    console.log(`STOP SERVER`)
    window.close()
  },
  set_node_number(nodeNumber){
    console.log(name + `: emit SET_NODE_NUMBER ${nodeNumber}`)
    socket.emit('SET_NODE_NUMBER', nodeNumber)
  },
  short_on_event(nodeNumber, eventNumber){
    console.log(`ASON ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_ON', {
      "nodeNumber": nodeNumber,
      "deviceNumber": eventNumber
    })
  },
  short_off_event(nodeNumber, eventNumber){
    console.log(`ASOF ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_OFF', {
      "nodeNumber": nodeNumber,
      "deviceNumber": eventNumber
    })
  },

  start_connection(data) {
    console.log(name + `: start_connection : ` + JSON.stringify(data))
    socket.emit('START_CONNECTION', data)
  },

  teach_event(nodeNumber, eventName, eventIndex) {
    socket.emit('TEACH_EVENT', {
      "nodeNumber": nodeNumber,
      "eventName": eventName,
      "eventIndex": eventIndex
    })
  },

  update_layout() {
    // don't update the layout if we're selecting one
    if (state.inStartup == false){
      console.log(`Update Layout Data : ` + state.title)
      socket.emit('UPDATE_LAYOUT_DATA', state.layout)
    }
  },
  update_node_variable(nodeNumber, nodeVariableIndex, nodeVariableValue) {
    state.nodes[nodeNumber].nodeVariables[nodeVariableIndex] = nodeVariableValue
    
    console.log(`NVsetNeedsLearnMode : ` + JSON.stringify(state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode))
    if((state.nodeDescriptors[nodeNumber])
        && (state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode)){
          console.log(`MAIN Update Node Variable in learn mode : `+nodeNumber+' : '+nodeVariableIndex+' : '+  nodeVariableValue)
          socket.emit('UPDATE_NODE_VARIABLE_IN_LEARN_MODE', {
        "nodeNumber": nodeNumber,
        "variableId": nodeVariableIndex,
        "variableValue": parseInt(nodeVariableValue)
      })
    } else {
      console.log(`MAIN Update Node Variable : `+nodeNumber+' : '+nodeVariableIndex+' : '+  nodeVariableValue)
      socket.emit('UPDATE_NODE_VARIABLE', {
        "nodeNumber": nodeNumber,
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
        "nodeNumber": nodeNumber,
        "variableId": nodeVariableIndex,
        "variableValue": parseInt(nodeVariableValue)
      })
    //}
  },
  update_event_variable(nodeNumber, eventName, eventIndex, eventVariableIndex, eventVariableValue) {
    console.log(`MAIN Update Event Variable : ${eventIndex} : ${eventVariableIndex} : ${eventVariableValue} `)
    state.nodes[nodeNumber].storedEvents[eventIndex].variables[eventVariableIndex] = eventVariableValue
    socket.emit('UPDATE_EVENT_VARIABLE',{
      "nodeNumber": nodeNumber,
      "eventName": eventName,
      "eventIndex": eventIndex,
      "eventVariableId": eventVariableIndex,
      "eventVariableValue": parseInt(eventVariableValue)
    })
  }
}

//-----------------------------------------------------------------------------
//  getters
//-----------------------------------------------------------------------------
const getters = {
  busEvent_status(eventIdentifier){
    if (eventIdentifier in state.busEvents) {
//      console.log(name + `: busEvent_status ` + state.busEvents[eventIdentifier].status)
      return state.busEvents[eventIdentifier].status
    } else {
      return ''
    }
  },
  event_name(eventIdentifier) {
    if (eventIdentifier in state.layout.eventDetails) {
      //console.log(`Event Name`)
      return state.layout.eventDetails[eventIdentifier].name
    } else {
      //console.log(`Event No Name ${JSON.stringify(eventIdentifier)}`)
      // create eventdetails entry if it doesn't exist
      setters.event_name(eventIdentifier, eventIdentifier)
      return JSON.stringify(eventIdentifier)
    }
  },
  event_colour(eventIdentifier) {
    if (eventIdentifier in state.layout.eventDetails) {
      //console.log(`Event Name`)
      return state.layout.eventDetails[eventIdentifier].colour
    } else {
      setters.event_colour(eventIdentifier, "black")
      //console.log(`Event No Name ${JSON.stringify(eventIdentifier)}`)
      return "black"
    }
  },
  event_group(eventIdentifier) {
    if (eventIdentifier in state.layout.eventDetails) {
      //console.log(`Event Name`)
      return state.layout.eventDetails[eventIdentifier].group
    } else {
      setters.event_group(eventIdentifier, "")
      //console.log(`Event No Name ${JSON.stringify(eventIdentifier)}`)
      return ""
    }
  },
  event_variable_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex){
    try{
      return state.nodes[nodeNumber].storedEventsNI[eventIdentifier].variables[eventVariableIndex]
    } catch (err){
//      console.log(name + `: event_variable_by_identifier: ${err}`)
      return 0
    }
  },
  node_can_id(nodeNumber){
    var CAN_ID = undefined
    try{
      CAN_ID = state.nodes[nodeNumber].CANID
    } catch (err){
      console.log(name + `: getters.node_can_id: ${err}`)
    }
    return CAN_ID
  },
  node_name(nodeNumber){
    try{
      if (nodeNumber in state.layout.nodeDetails == false){
        state.layout.nodeDetails[nodeNumber] = {}
        state.layout.nodeDetails[nodeNumber].name = 
          state.nodes[nodeNumber].moduleName + ' (' + nodeNumber.toString() + ')'
        state.layout.nodeDetails[nodeNumber].colour = "black"
        state.layout.nodeDetails[nodeNumber].group = ""
        state.update_layout_needed = true
      }
      if (state.layout.nodeDetails[nodeNumber].name == undefined){
        state.layout.nodeDetails[nodeNumber].name = "undefined"
      }
      return state.layout.nodeDetails[nodeNumber].name
    } catch (err) {
      console.log(name + `: getters.node_name: ${err}`)
      return "error"      
    }
  },
  node_parameter_name(nodeNumber, parameterIndex){
    var result = 'Index: ' + parameterIndex
    try{
//      result = 'Index: ' + parameterIndex
      result = parameterIndex + ': ' + NodeParameterNames[parameterIndex]   
    } catch (err) {
      console.log(name + `: getters.node_parameter_name: ${err}`)
    }
    return result
  },
  node_parameter_value(nodeNumber, parameterIndex){
    var result = undefined
    try{
      result = state.nodes[nodeNumber].parameters[parameterIndex]   
    } catch (err) {
      console.log(name + `: getters: node_parameter_value: ${err}`)
    }
    return result
  }

}

//-----------------------------------------------------------------------------
//  setters
//-----------------------------------------------------------------------------
const setters = {
  event_name(eventIdentifier, eventName) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
    state.layout.eventDetails[eventIdentifier].name = eventName
//    console.log(name + ': setter event_name ' + eventIdentifier + ' : ' + eventName)
    state.update_layout_needed = true
  },
  event_colour(eventIdentifier, eventColour) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
    state.layout.eventDetails[eventIdentifier].colour = eventColour
//    console.log(name + ': setter event_colour ' + eventIdentifier + ' : ' + eventColour)
    state.update_layout_needed = true
  },
  event_group(eventIdentifier, eventGroup) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
    state.layout.eventDetails[eventIdentifier].group = eventGroup
//    console.log(name + ': setter event_group ' + eventIdentifier + ' : ' + eventGroup)
    state.update_layout_needed = true
  },
  node_name(nodeNumber, nodeName){
    if (nodeNumber in state.layout.nodeDetails === false){
      state.layout.nodeDetails[nodeNumber] = {}
      state.layout.nodeDetails[nodeNumber].colour = "black"
      state.layout.nodeDetails[nodeNumber].group = ""
    }
    state.layout.nodeDetails[nodeNumber].name = nodeName
//    console.log(name + ': setter node_name ' + nodeNumber + ' : ' + nodeName)
    state.update_layout_needed = true
  }

}

//-----------------------------------------------------------------------------
//  socket events
//-----------------------------------------------------------------------------
const socket = io(`http://${host}:${port}`)

socket.on('BACKUPS_LIST', (data) => {
  console.log(name + `RECEIVED BACKUPS_LIST ` + JSON.stringify(data))
  state.backups_list = data;
})

socket.on("BUS_CONNECTION", (data) => {
  eventBus.emit('BUS_CONNECTION_EVENT', data)
//  console.log(name + `: RECEIVED BUS_CONNECTION ` + JSON.stringify(data))
})

socket.on("BUS_EVENTS", (data) => {
  console.log(name + `: RECEIVED BUS_EVENTS Data`)
  state.busEvents = data
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
  if (state.nodeTraffic.length > 32) {
    state.nodeTraffic.shift()
  }
  eventBus.emit('BUS_TRAFFIC_EVENT', data)
})

socket.on("connect", () => {
  console.log(`Socket Connect`)
  socket.emit('REQUEST_VERSION')
  socket.emit('REQUEST_LAYOUTS_LIST')
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

socket.on('dccSessions', function (data) {
  console.log(`RECEIVED DCC Sessions`)
  // console.log(`CBUS Errors Received:${JSON.stringify(data)}`)
  state.dcc_sessions = data;
})

socket.on("disconnect", (data) => {
  console.log(name + `: disconnect`)
  eventBus.emit('SERVER_DISCONNECT')
})

socket.on("error", (data) => {
  console.log(name + `: connection error`)
})

socket.on('LAYOUT_DATA', (data) => {
  console.log(`RECEIVED Layout Data`)
  state.layout = data;
})

socket.on('LAYOUTS_LIST', (data) => {
  console.log(`RECEIVED Layouts list`)
  state.layouts_list = data;
})

socket.on("NODE", (data) => {
  console.log(`RECEIVED NODE : ${data.nodeNumber}`)
//  console.log(`RECEIVED NODE : ${data.nodeNumber} Data: ` + JSON.stringify(data))
  state.nodes[data.nodeNumber] = data
  try{
    var storedEvents = Object.values(state.nodes[data.nodeNumber].storedEvents)
    storedEvents.forEach(event => {
      // call the get event name, as this will populate eventDetails if it doesn't exist
      getters.event_name(event.eventIdentifier)
    })
  } catch(err){
    console.log(name + `: socket.on NODE: ` + err)
  }
})

socket.on("NODES", (data) => {
  console.log(`RECEIVED NODES`)
  state.nodes = data
  try{
    var nodes = Object.values(state.nodes)
    nodes.forEach(node =>{
      var storedEvents = Object.values(state.nodes[node.nodeNumber].storedEvents)
      storedEvents.forEach(event => {
        // call the get event name, as this will populate eventDetails if it doesn't exist
        getters.event_name(event.eventIdentifier)
      })
    })
  } catch(err){
    console.log(name + `: socket.on NODES: ` + err)
  }
})

socket.on("NODE_DESCRIPTOR", (data) => {
  var nodeNumber = Object.keys(data)[0]   // get first key
  console.log(`RECEIVED NODE_DESCRIPTOR : node ` + nodeNumber)
  state.nodeDescriptors[nodeNumber] = Object.values(data)[0]    // get first value
})

socket.on("NODE_DESCRIPTOR_FILE_LIST", (nodeNumber, list) => {
  console.log(`RECEIVED NODE_DESCRIPTOR_FILE_LIST : node ` + nodeNumber)
//  console.log(`RECEIVED NODE_DESCRIPTOR_FILE_LIST : list ` + list)
  state.nodeDescriptorList[nodeNumber] = list
})

socket.on("PROGRAM_NODE_PROGRESS", (text) => {
  console.log(`RECEIVED PROGRAM_NODE_PROGRESS : ` + text)
  eventBus.emit('PROGRAM_NODE_PROGRESS', text)
})

socket.on("REQUEST_NODE_NUMBER", (nodeNumber) => {
  console.log(`RECEIVED REQUEST_NODE_NUMBER : ` + JSON.stringify(nodeNumber))
  eventBus.emit('REQUEST_NODE_NUMBER_EVENT', nodeNumber)
})

socket.on("STATUS", (data) => {
  if (data.mode == "RUNNING"){
    state.inStartup = false
  }
  eventBus.emit('STATUS_EVENT', data)
//  console.log(name + `: RECEIVED STATUS ` + JSON.stringify(data))
})

socket.on("VERSION", (data) => {
  console.log(`RECEIVED VERSION ` + JSON.stringify(data))
  state.version = data
})

export default {
  state,
  methods,
  getters,
  setters,
  eventBus
}
