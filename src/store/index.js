import {reactive} from 'vue'
import io from 'socket.io-client'
//import VueSocketIO from 'vue-socket.io'
import { EventBus } from 'quasar'
import {NodeParameterNames} from "src/definitions/Text_NodeParameterNames"
import {secondsNow} from "components/functions/utils.js"

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
  exported_MDF: {},
  inStartup: true,
  layout: {},
  layouts_list: [],
  loadFile_notification_raised: {},
  MDFupdateTimestamp: Date.now(),
  nodeDescriptors: {},
  nodeDescriptorList: {},
  nodes: {},
  nodeTraffic: [],
  server: { "nodes":{} },
  selected_node: 0,
  serverStatus: {},
  title: "MMC",
  update_layout_needed: false,
  version: {}
})

//-----------------------------------------------------------------------------
//  Methods
//-----------------------------------------------------------------------------
const methods = {
  change_layout(layoutName){
    console.log(name + `: CHANGE_LAYOUT: ` + JSON.stringify(layoutName))
    socket.emit('CHANGE_LAYOUT', {
      "layoutName": layoutName
    })
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

  import_module_descriptor(nodeNumber, moduleDescriptor) {
    console.log(`import_module_descriptor : ` + moduleDescriptor.moduleDescriptorFilename)
    socket.emit('IMPORT_MODULE_DESCRIPTOR', {"nodeNumber":nodeNumber, "moduleDescriptor":moduleDescriptor})
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

  request_MDF_delete(filename) {
    console.log(`REQUEST_MDF_DELETE : ` + filename)
    socket.emit('REQUEST_MDF_DELETE', {"filename":filename})
  },

  request_MDF_export(location, filename) {
    console.log(`REQUEST_MDF_EXPORT : ` + location + ' ' + filename)
    socket.emit('REQUEST_MDF_EXPORT', {"location":location, "filename":filename})
  },

  remove_node(nodeNumber) {
    // remove node from layout data
    delete state.layout.nodeDetails[nodeNumber]
    state.update_layout_needed = true
    socket.emit('REMOVE_NODE', nodeNumber)
    console.log(name + ': sent REMOVE_NODE ' + nodeNumber)
  },
  request_backups_list(layoutName) {
    console.log(`request_backups_list : ` + layoutName)
    socket.emit('REQUEST_BACKUPS_LIST', {"layoutName":layoutName})
  },
  request_backups_list(layoutName) {
    console.log(`request_backups_list : ` + layoutName)
    socket.emit('REQUEST_BACKUPS_LIST', {"layoutName":layoutName})
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
    console.log(`REQUEST_ALL_NODE_VARIABLES: node ` + nodeNumber + ' variables ' + variables)
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
  request_event_variables_by_identifier(nodeNumber, eventIdentifier) {
    console.log(name + `: REQUEST_EVENT_VARIABLES_BY_IDENTIFIER: nodeNumber: ` + nodeNumber + ` eventIdentifier: ` + eventIdentifier)
    socket.emit('REQUEST_EVENT_VARIABLES_BY_IDENTIFIER', {
      "nodeNumber": nodeNumber,
      "eventIdentifier": eventIdentifier
    })
  },
  request_service_discovery(nodeNumber) {
    console.log(`Request Service Discovery : ` + nodeNumber)
    socket.emit('REQUEST_SERVICE_DISCOVERY', {"nodeNumber":nodeNumber})
  },

  request_server_status(){
    socket.emit('REQUEST_SERVER_STATUS')
  },
  request_version(){
    socket.emit('REQUEST_VERSION')
  },
  request_layout_list(){
    console.log(name + `: request_layout_list:`)
    socket.emit('REQUEST_LAYOUTS_LIST')
  },
  request_matching_mdf_list(nodeNumber, location) {
    console.log(name + ': REQUEST_MATCHING_MDF_LIST: ' + location)
    if (state.server.nodes[nodeNumber] == undefined){state.server.nodes[nodeNumber] = {} }
    state.server.nodes[nodeNumber][location + '_MDF_List'] = []
    socket.emit('REQUEST_MATCHING_MDF_LIST', {"nodeNumber":nodeNumber, "location":location})
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
  update_layout() {
      console.log(`Update Layout Data : ` + state.title)
      socket.emit('UPDATE_LAYOUT_DATA', state.layout)
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
  }

}

//-----------------------------------------------------------------------------
//  getters
//-----------------------------------------------------------------------------
const getters = {
  busEvent_status(eventIdentifier){
    if (eventIdentifier in state.busEvents) {
      return state.busEvents[eventIdentifier].status
    } else {
      return ''
    }
  },
  event_name(eventIdentifier) {
    if (eventIdentifier in state.layout.eventDetails) {
      try {
        if (state.layout.eventDetails[eventIdentifier].name.length > 0){
          return state.layout.eventDetails[eventIdentifier].name
        }
      } catch {}  // not worried if it fails, we'll sort a return at the end
    } else {
      setters.event_name(eventIdentifier, '')
    }
    return '(' + eventIdentifier + ')'
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
      console.log(name + `: event_variable_by_identifier: ${err}`)
      return 0
    }
  },
  module_name(nodeNumber){
    try{
      if (state.nodes[nodeNumber].moduleName){
        return state.nodes[nodeNumber].moduleName
      } else {
        return state.layout.nodeDetails[nodeNumber].moduleName
      }
    } catch{
      return "unknown"
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
        state.layout.nodeDetails[nodeNumber].name = undefined
        state.layout.nodeDetails[nodeNumber].colour = "black"
        state.layout.nodeDetails[nodeNumber].group = ""
        state.update_layout_needed = true
      }
      if (state.layout.nodeDetails[nodeNumber].name == undefined){
        try{
          return state.nodes[nodeNumber].moduleName + ' (' + nodeNumber.toString() + ')'
        } catch {
          return 'Unrecognised module (' + nodeNumber.toString() + ')'
        }
      } else {
        return state.layout.nodeDetails[nodeNumber].name
      }
    } catch (err) {
      console.log(name + `: getters.node_name: ${err}`)
      return "error"      
    }
  },
  node_group(nodeNumber){
    try{
      if (nodeNumber in state.layout.nodeDetails == false){
        state.layout.nodeDetails[nodeNumber] = {}
        state.layout.nodeDetails[nodeNumber].name = 
        state.nodes[nodeNumber].moduleName + ' (' + nodeNumber.toString() + ')'
        state.layout.nodeDetails[nodeNumber].colour = "black"
        state.layout.nodeDetails[nodeNumber].group = ""
        state.update_layout_needed = true
      }
      if (state.layout.nodeDetails[nodeNumber].group == undefined){
        state.layout.nodeDetails[nodeNumber].group = ""
        state.update_layout_needed = true
      }
      return state.layout.nodeDetails[nodeNumber].group
    } catch (err) {
      console.log(name + `: getters.node_group: ${err}`)
      return ""      
    }
  },
  node_parameter_name(nodeNumber, parameterIndex){
    var result = 'Index: ' + parameterIndex
    try{
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
  addNodeToLayout(nodeNumber, moduleIdentifer, moduleName){
    console.log(secondsNow() + ': ' + name + `: addNodeToLayout: ${nodeNumber} ${moduleIdentifer} ${moduleName}`)
    if (nodeNumber != undefined){
      if (nodeNumber in state.layout.nodeDetails === false){
        state.layout.nodeDetails[nodeNumber] = {}
        state.layout.nodeDetails[nodeNumber].colour = "black"
        state.layout.nodeDetails[nodeNumber].group = ""
        state.update_layout_needed = true
      }
      if (moduleIdentifer != undefined){
        if (state.layout.nodeDetails[nodeNumber].moduleIdentifer != moduleIdentifer){
          state.layout.nodeDetails[nodeNumber].moduleIdentifer = moduleIdentifer
          state.update_layout_needed = true
        }
      }
      if (moduleName != undefined){
        if (state.layout.nodeDetails[nodeNumber].moduleName != moduleName){
          state.layout.nodeDetails[nodeNumber].moduleName = moduleName
          state.update_layout_needed = true
        }
      }
    }
  },
  event_name(eventIdentifier, eventName) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
    state.layout.eventDetails[eventIdentifier].name = eventName
    state.update_layout_needed = true
  },
  event_colour(eventIdentifier, eventColour) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
    state.layout.eventDetails[eventIdentifier].colour = eventColour
    state.update_layout_needed = true
  },
  event_group(eventIdentifier, eventGroup) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
    state.layout.eventDetails[eventIdentifier].group = eventGroup
    state.update_layout_needed = true
  },
  node_group(nodeNumber, Group){
    if (nodeNumber in state.layout.nodeDetails === false){
      state.layout.nodeDetails[nodeNumber] = {}
      state.layout.nodeDetails[nodeNumber].colour = "black"
      state.layout.nodeDetails[nodeNumber].group = ""
    }
    state.layout.nodeDetails[nodeNumber].group = Group
    state.update_layout_needed = true
  },
  node_name(nodeNumber, nodeName){
    if (nodeNumber in state.layout.nodeDetails === false){
      state.layout.nodeDetails[nodeNumber] = {}
      state.layout.nodeDetails[nodeNumber].colour = "black"
      state.layout.nodeDetails[nodeNumber].group = ""
    }
    state.layout.nodeDetails[nodeNumber].name = nodeName
    state.update_layout_needed = true
  }

}

//-----------------------------------------------------------------------------
//  socket events
//-----------------------------------------------------------------------------
const socket = io(`http://${host}:${port}`)

socket.on('BACKUPS_LIST', (data) => {
  console.log(secondsNow() + ': ' + name + `RECEIVED BACKUPS_LIST ` + JSON.stringify(data))
  state.backups_list = data;
})

socket.on("BUS_EVENTS", (data) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED BUS_EVENTS Data`)
  state.busEvents = data
})

socket.on("CBUS_ERRORS", (data) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED CBUS_ERRORS `)
  state.cbus_errors = data
})

socket.on("CBUS_NO_SUPPORT", (data) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED CBUS_NO_SUPPORT `)
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
  console.log(secondsNow() + ': ' + name + `: RECEIVED Layout Data`)
  state.layout = data;
  // put a fresh timestamp on it
  state.layout.updateTimestamp = Date.now()
})

socket.on('LAYOUTS_LIST', (data) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED LAYOUTS_LIST`)
  state.layouts_list = data;
})


socket.on("MDF_EXPORT", (location, filename, MDF) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED MDF_EXPORT ` + location + ' ' + filename)
  state.exported_MDF = MDF
  state.MDFupdateTimestamp = Date.now()
})

socket.on("MATCHING_MDF_LIST", (location, nodeNumber, list) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED MATCHING_MDF_LIST ` + nodeNumber + ' ' + location + ' ' + list.length)
  if (state.server.nodes[nodeNumber] == undefined){state.server.nodes[nodeNumber] = {} }
  state.server.nodes[nodeNumber][location + '_MDF_List'] = list
  state.MDFupdateTimestamp = Date.now()
})

socket.on("NODE", (data) => {
  state.nodes["updateTimestamp"] = Date.now()
  console.log(secondsNow() + ': ' + name + `: RECEIVED NODE: ${data.nodeNumber}`)
  // remove original stored events by Index
  delete data.storedEvents
  state.nodes[data.nodeNumber] = data
  setters.addNodeToLayout(data.nodeNumber, data.moduleIdentifier, data.moduleName)
  try{
    var events = Object.values(state.nodes[data.nodeNumber].storedEventsNI)
    events.forEach(event => {
      // call the get event name, as this will populate eventDetails if it doesn't exist
      getters.event_name(event.eventIdentifier)
    })
  } catch(err){
    console.log(name + `: socket.on NODE: ` + err)
  }
})

socket.on("NODES", (data) => {
  state.nodes["updateTimestamp"] = Date.now()
  console.log(secondsNow() + ': ' + name + ': RECEIVED NODES')
  var nodes = Object.values(data)
  // remove original stored events by Index
  nodes.forEach(node =>{
    delete data[node.nodeNumber].storedEvents
  })
  state.nodes = data
  try{
    var nodes = Object.values(state.nodes)
    nodes.forEach(node =>{
      setters.addNodeToLayout(node.nodeNumber, node.moduleIdentifer, node.moduleName)
      var storedEvents = Object.values(state.nodes[node.nodeNumber].storedEventsNI)
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
  var moduleDescriptor = Object.values(data)[0] // get first value
  console.log(secondsNow() + ': ' + name + `: RECEIVED NODE_DESCRIPTOR : node ` + nodeNumber + ' ' + moduleDescriptor.moduleDescriptorFilename)
  state.nodeDescriptors[nodeNumber] = moduleDescriptor    
  state.MDFupdateTimestamp = Date.now()
})

socket.on("NODE_DESCRIPTOR_FILE_LIST", (nodeNumber, list) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED NODE_DESCRIPTOR_FILE_LIST : node ` + nodeNumber)
//  console.log(`RECEIVED NODE_DESCRIPTOR_FILE_LIST : list ` + list)
  state.nodeDescriptorList[nodeNumber] = list
})

socket.on("PROGRAM_NODE_PROGRESS", (text) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED PROGRAM_NODE_PROGRESS : ` + text)
  eventBus.emit('PROGRAM_NODE_PROGRESS', text)
})

socket.on("REQUEST_NODE_NUMBER", (nodeNumber, moduleName) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED REQUEST_NODE_NUMBER : ` + JSON.stringify(nodeNumber) + ' moduleName ' + moduleName)
  eventBus.emit('REQUEST_NODE_NUMBER_EVENT', nodeNumber, moduleName)
})

socket.on("SERVER_STATUS", (data) => {
  if (data.mode == "RUNNING"){
    state.inStartup = false
  }
  state.serverStatus = data
  eventBus.emit('SERVER_STATUS_EVENT', data)
})

socket.on("VERSION", (data) => {
  console.log(secondsNow() + ': ' + name + `: RECEIVED VERSION ` + JSON.stringify(data))
  state.version = data
})

export default {
  state,
  methods,
  getters,
  setters,
  eventBus
}
