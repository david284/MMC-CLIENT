import {reactive} from 'vue'
import io from 'socket.io-client'
//import VueSocketIO from 'vue-socket.io'
import { EventBus } from 'quasar'
import {NodeParameterNames} from "src/definitions/Text_NodeParameterNames"
import {timeStampedLog} from "components/functions/utils.js"
import { getNumberOfChannels } from "components/functions/NodeFunctions"


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
  //develop: true,
  events_view_mode: 'all',
  event_view_status: [],
  exported_MDF: {},
  inStartup: true,
  cbusTrafficTimeStamp: 0,
  layout: {},
  layouts_list: [],
  loadFile_notification_raised: {},
  MDFupdateTimestamp: Date.now(),
  moduleNames: {},
  nodeDescriptors: {},
  nodes: {},
  nodeTraffic: [],
  nodes_view_mode: 'split',
  notification_settings:{backup_notify: true, networkConnection_notify: true, serialConnection_notify: true},
  restoredData: {},
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

  //
  change_layout(layoutName){
    timeStampedLog(name + `: CHANGE_LAYOUT: ` + JSON.stringify(layoutName))
    socket.emit('CHANGE_LAYOUT', {
      "layoutName": layoutName
    })
  },
  //
  clear_bus_events() {
    socket.emit('CLEAR_BUS_EVENTS')
    timeStampedLog(name + `: CLEAR_BUS_EVENTS`)
  },
  //
  clear_cbus_errors() {
    socket.emit('CLEAR_CBUS_ERRORS')
    timeStampedLog(`CLEAR_CBUS_ERRORS`)
  },
  //
  clear_node_events(nodeNumber) {
    timeStampedLog(`CLEAR_NODE_EVENTS ${nodeNumber}`)
    socket.emit('CLEAR_NODE_EVENTS',{
      "nodeNumber": nodeNumber
    })
  },
  //
  delete_all_events(nodeNumber) {
    socket.emit('DELETE_ALL_EVENTS', {
        "nodeNumber": nodeNumber
    })
    timeStampedLog(name + `: DELETE_ALL_EVENTS ${nodeNumber}`)
  },
  //
  delete_layout(layoutName) {
    socket.emit('DELETE_LAYOUT', {
        "layoutName": layoutName
    })
    timeStampedLog(name + `: DELETE_LAYOUT ${layoutName}`)
  },
  //
  delete_node_backup(layoutName, nodeNumber, fileName) {
    timeStampedLog(name + `: DELETE_NODE_BACKUP ${layoutName} ${nodeNumber} ${fileName}`)
    socket.emit('DELETE_NODE_BACKUP', {
        "layoutName": layoutName,
        "nodeNumber":nodeNumber,
        "fileName":fileName
    })
  },
  //
  // reLoad false to surpress reLoading of variables after writing - like when restoring node
  event_teach_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex, eventVariableValue, reLoad, linkedVariableList){
    timeStampedLog(name + `: event_teach_by_identifier : ${nodeNumber} ${eventIdentifier} ${eventVariableIndex} ${eventVariableValue} ${JSON.stringify(linkedVariableList)} `)
    socket.emit('EVENT_TEACH_BY_IDENTIFIER',{
      "nodeNumber": nodeNumber,
      "eventIdentifier": eventIdentifier,
      "eventVariableIndex": eventVariableIndex,
      "eventVariableValue": parseInt(eventVariableValue),
      "reLoad": reLoad,
      "linkedVariableList": linkedVariableList
    })
  },
  //
  import_module_descriptor(nodeNumber, moduleDescriptor) {
    timeStampedLog(`import_module_descriptor : ` + moduleDescriptor.moduleDescriptorFilename)
    socket.emit('IMPORT_MODULE_DESCRIPTOR', {"nodeNumber":nodeNumber, "moduleDescriptor":moduleDescriptor})
  },
  //
  long_on_event(nodeNumber, eventNumber){
    timeStampedLog(`ACON ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_LONG_ON', {
      "nodeNumber": nodeNumber,
      "eventNumber": eventNumber
    })
  },
  //
  long_off_event(nodeNumber, eventNumber){
    timeStampedLog(`ACOF ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_LONG_OFF', {
      "nodeNumber": nodeNumber,
      "eventNumber": eventNumber
    })
  },
  //
  node_can_id_enum(nodeNumber){
    timeStampedLog(name + `: CANID_ENUM : ` + nodeNumber)
    socket.emit('CANID_ENUM', nodeNumber)
  },
  //
  program_node(nodeNumber, cpuType, flags, hexFile) {
    timeStampedLog(name + `: PROGRAM_NODE : node: ${nodeNumber} hexfile: ${hexFile.name}`)
    socket.emit('PROGRAM_NODE', {
      "nodeNumber": nodeNumber,
      "cpuType": cpuType,
      "flags": flags,
      "hexFile": hexFile
    })
  },
  //
  query_all_nodes() {
    timeStampedLog(`QUERY_ALL_NODES`)
    socket.emit('QUERY_ALL_NODES')
  },
  //
  remove_event(nodeNumber, eventName) {
    socket.emit('REMOVE_EVENT', {
        "nodeNumber": nodeNumber,
        "eventName": eventName
    })
  },
  //
  remove_node(nodeNumber) {
    // remove node from layout data
    delete state.layout.nodeDetails[nodeNumber]
    state.update_layout_needed = true
    socket.emit('REMOVE_NODE', nodeNumber)
    timeStampedLog(name + ': sent REMOVE_NODE ' + nodeNumber)
  },
  //
  rename_node_backup(layoutName, nodeNumber, fileName, newFileName) {
    let data = {
      "layoutName": layoutName,
      "nodeNumber": nodeNumber,
      "fileName": fileName,
      "newFileName": newFileName
    }
    socket.emit('RENAME_NODE_BACKUP', data)
    timeStampedLog(name + ': sent RENAME_NODE_BACKUP ' + JSON.stringify(data))
  },
  //
  requestAllEventVariablesForNode(nodeNumber) {
    socket.emit('REQUEST_ALL_EVENT_VARIABLES_FOR_NODE', {
      "nodeNumber": nodeNumber
    })
    timeStampedLog(`REQUEST_ALL_EVENT_VARIABLES_FOR_NODE: node ` + nodeNumber)
  },
  //
  request_archived_logs_list() {
    timeStampedLog(`REQUEST_ARCHIVED_LOGS_LIST :`)
    socket.emit('REQUEST_ARCHIVED_LOGS_LIST')
  },
  //
  request_binary_file(directory, fileName) {
    timeStampedLog(`REQUEST_BINARY_FILE : ` + directory + ' ' + fileName)
    socket.emit('REQUEST_BINARY_FILE', {"directory":directory, "fileName":fileName})
  },
  //
  request_diagnostics(nodeNumber, serviceIndex) {
    if (serviceIndex == undefined){serviceIndex = 0;}
    timeStampedLog(`Request Service Diagnostics : node ` + nodeNumber + ' Service Index ' + serviceIndex )
    socket.emit('REQUEST_DIAGNOSTICS', {"nodeNumber":nodeNumber, "serviceIndex":serviceIndex})
  },
  //
  request_all_node_parameters(nodeNumber, parameters, delay) {
    socket.emit('REQUEST_ALL_NODE_PARAMETERS', {"nodeNumber": nodeNumber, "parameters": parameters, "delay": delay})
    timeStampedLog(`REQUEST_ALL_NODE_PARAMETERS`)
  },
  //
  request_node_parameter(nodeNumber, parameter) {
    socket.emit('RQNPN', {"nodeNumber": nodeNumber, "parameter": parameter})
  },
  //
  request_all_node_variables(nodeNumber) {
    socket.emit('REQUEST_ALL_NODE_VARIABLES', {
      "nodeNumber": nodeNumber
    })
    timeStampedLog(`REQUEST_ALL_NODE_VARIABLES: node ` + nodeNumber)
  },
  //
  refresh_bus_events() {
    socket.emit('REQUEST_BUS_EVENTS')
    timeStampedLog(name + `: REQUEST_BUS_EVENTS`)
  },
  //
  request_firmware_info(file) {
    timeStampedLog(`REQUEST_FIRMWARE_INFO : ` + file.name)
    socket.emit('REQUEST_FIRMWARE_INFO', file)
  },

  //
  request_log_file(filename) {
    timeStampedLog(`REQUEST_LOG_FILE : ` + filename)
    socket.emit('REQUEST_LOG_FILE', {"fileName":filename})
  },
  //
  request_MDF_delete(filename, nodeNumber) {
    timeStampedLog(`REQUEST_MDF_DELETE : ${filename} ${nodeNumber}`)
    socket.emit('REQUEST_MDF_DELETE', {"filename":filename, "nodeNumber":nodeNumber})
  },
  //
  request_MDF_export(location, filename) {
    timeStampedLog(`REQUEST_MDF_EXPORT : ` + location + ' ' + filename)
    socket.emit('REQUEST_MDF_EXPORT', {"location":location, "filename":filename})
  },
  //
  request_node_backup(layoutName, nodeNumber, filename) {
    timeStampedLog(`REQUEST_NODE_BACKUP : ` + layoutName + ' ' + nodeNumber + ' ' + filename)
    socket.emit('REQUEST_NODE_BACKUP', {"layoutName":layoutName, "nodeNumber":nodeNumber, "fileName":filename})
  },
  //
  request_node_backups_list(layoutName, nodeNumber) {
    timeStampedLog(`REQUEST_NODE_BACKUPS_LIST : ` + layoutName)
    socket.emit('REQUEST_NODE_BACKUPS_LIST', {"layoutName":layoutName, 'nodeNumber':nodeNumber})
  },
  //
  request_node_variable(nodeNumber, variable) {
    socket.emit('REQUEST_NODE_VARIABLE', {
      "nodeNumber": nodeNumber,
      "variableId": variable,
    })
  },
  //
  request_all_node_events(nodeNumber) {
    socket.emit('REQUEST_ALL_NODE_EVENTS', {"nodeNumber": nodeNumber})
    timeStampedLog(name + `: REQUEST_ALL_NODE_EVENTS ${nodeNumber}`)
  },
  //
  request_event_variables_by_identifier(nodeNumber, eventIdentifier) {
    timeStampedLog(name + `: REQUEST_EVENT_VARIABLES_BY_IDENTIFIER: nodeNumber: ` + nodeNumber + ` eventIdentifier: ` + eventIdentifier)
    socket.emit(`REQUEST_EVENT_VARIABLES_BY_IDENTIFIER`, {
      "nodeNumber": nodeNumber,
      "eventIdentifier": eventIdentifier
    })
  },
  //
  request_service_discovery(nodeNumber) {
    timeStampedLog(`Request Service Discovery : ` + nodeNumber)
    socket.emit('REQUEST_SERVICE_DISCOVERY', {"nodeNumber":nodeNumber})
  },
  //
  request_server_status(){
    socket.emit('REQUEST_SERVER_STATUS')
  },
  //
  request_version(){
    socket.emit('REQUEST_VERSION')
  },
  //
  request_layout_list(){
    timeStampedLog(name + `: request_layout_list:`)
    socket.emit('REQUEST_LAYOUTS_LIST')
  },
  //
  request_matching_mdf_list(nodeNumber, location) {
    timeStampedLog(name + ': REQUEST_MATCHING_MDF_LIST: ' + location)
    if (state.server.nodes[nodeNumber] == undefined){state.server.nodes[nodeNumber] = {} }
    state.server.nodes[nodeNumber][location + '_MDF_List'] = []
    socket.emit('REQUEST_MATCHING_MDF_LIST', {"nodeNumber":nodeNumber, "location":location})
  },
  //
  reset_node(nodeNumber) {
    socket.emit('RESET_NODE', nodeNumber)
    timeStampedLog(name + ': RESET_NODE ' + nodeNumber)
  },
  //
  save_node_backup(nodeNumber, backupNode){
    timeStampedLog(`SAVE_NODE_BACKUP`)
    let data = {
      'layoutName': state.layout.layoutDetails.title,
      'nodeNumber': nodeNumber,
      'layout': state.layout,
      'backupNode': backupNode
    }
    socket.emit('SAVE_NODE_BACKUP', data)
  },
  //
  send_cbus_message(message){
    socket.emit('SEND_CBUS_MESSAGE', message)
    timeStampedLog(name + `: SEND_CBUS_MESSAGE: ${message}` )
  },
  //
  set_can_id(nodeNumber, CAN_ID){
    var data = {}
    data['nodeNumber'] = nodeNumber
    data['CAN_ID'] = CAN_ID
    socket.emit('SET_CAN_ID', data)
    timeStampedLog(name + `: SET_CAN_ID: node ` + JSON.stringify(data))
  },
  //
  STOP_SERVER(nodeNumber) {
    socket.emit('STOP_SERVER')
    timeStampedLog(`STOP SERVER`)
    window.close()
  },
  //
  set_node_number(nodeNumber){
    timeStampedLog(name + `: emit SET_NODE_NUMBER ${nodeNumber}`)
    socket.emit('SET_NODE_NUMBER', nodeNumber)
  },
  //
  short_on_event(nodeNumber, eventNumber){
    timeStampedLog(`ASON ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_ON', {
      "nodeNumber": nodeNumber,
      "deviceNumber": eventNumber
    })
  },
  //
  short_off_event(nodeNumber, eventNumber){
    timeStampedLog(`ASOF ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_OFF', {
      "nodeNumber": nodeNumber,
      "deviceNumber": eventNumber
    })
  },
  //
  start_connection(data) {
    timeStampedLog(name + `: start_connection : ` + JSON.stringify(data))
    socket.emit('START_CONNECTION', data)
  },
  //
  update_layout() {
      timeStampedLog(`Update Layout Data : ` + state.layout.layoutDetails.title)
      //timeStampedLog(`Update Layout Data : ` + JSON.stringify(state.layout))
      socket.emit('UPDATE_LAYOUT_DATA', state.layout)
  },
  //
  // reLoad is a flag to indicate if node variable(s) need to be read back
  // we don't want to read any back if doing bulk programming (e.g. restoring a node)
  //
  update_node_variable(nodeNumber, nodeVariableIndex, nodeVariableValue, reLoad, linkedVariableList) {
    timeStampedLog(name + `: update_node_variable: ${nodeNumber} ${nodeVariableIndex} ${nodeVariableValue} ${reLoad} ${JSON.stringify(linkedVariableList)}`)
    state.nodes[nodeNumber].nodeVariables[nodeVariableIndex] = nodeVariableValue
    if (reLoad != false){reLoad = true}
    let data = {
      "nodeNumber": nodeNumber,
      "variableId": nodeVariableIndex,
      "variableValue": parseInt(nodeVariableValue),
      "reLoad":reLoad,
      "linkedVariableList": linkedVariableList
    }
    //timeStampedLog(`NVsetNeedsLearnMode : ` + JSON.stringify(state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode))
    if((state.nodeDescriptors[nodeNumber])
        && (state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode)){
          //timeStampedLog(name + `: Update Node Variable in learn mode: ${nodeNumber} ${nodeVariableIndex} ${nodeVariableValue} ${reLoad}`)
          socket.emit('UPDATE_NODE_VARIABLE_IN_LEARN_MODE', data)
    } else {
      //timeStampedLog(name + `: Update Node Variable: ${nodeNumber} ${nodeVariableIndex} ${nodeVariableValue} ${reLoad}`)
      socket.emit('UPDATE_NODE_VARIABLE', data)
    }
    // let capture the last timestamp
    data["lastReceiveTimestamp"] = state.nodes[nodeNumber].lastReceiveTimestamp
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
      //timeStampedLog(`Event Name`)
      return state.layout.eventDetails[eventIdentifier].colour
    } else {
      setters.event_colour(eventIdentifier, "black")
      //timeStampedLog(`Event No Name ${JSON.stringify(eventIdentifier)}`)
      return "black"
    }
  },
  event_group(eventIdentifier) {
    if (eventIdentifier in state.layout.eventDetails) {
      //timeStampedLog(`Event Name`)
      return state.layout.eventDetails[eventIdentifier].group
    } else {
      setters.event_group(eventIdentifier, "")
      //timeStampedLog(`Event No Name ${JSON.stringify(eventIdentifier)}`)
      return ""
    }
  },
  event_variable_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex){
    //timeStampedLog(name + `: event_variable_by_identifier: ${nodeNumber} ${eventIdentifier} ${eventVariableIndex}`)
    try{
      return state.nodes[nodeNumber].storedEventsNI[eventIdentifier].variables[eventVariableIndex]
    } catch (err){
      // don't worry if can't read, as may have not yet filled in storedEventsNI structure
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
  module_version(nodeNumber){
    try{
      if (state.nodes[nodeNumber].moduleVersion){
        return state.nodes[nodeNumber].moduleVersion
      }
    } catch{
      return ""
    }
  },
  node_can_id(nodeNumber){
    var CAN_ID = undefined
    try{
      CAN_ID = state.nodes[nodeNumber].CANID
    } catch (err){
      timeStampedLog(name + `: getters.node_can_id: ${err}`)
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
      if ((state.layout.nodeDetails[nodeNumber].name == undefined) ||
        (state.layout.nodeDetails[nodeNumber].name.length == 0) ){
        try{
          return state.nodes[nodeNumber].moduleName + ' (' + nodeNumber.toString() + ')'
        } catch {
          return 'Unrecognised module (' + nodeNumber.toString() + ')'
        }
      } else {
        return state.layout.nodeDetails[nodeNumber].name
      }
    } catch (err) {
      timeStampedLog(name + `: getters.node_name: ${err}`)
      return "error"
    }
  },
  node_channel_name(nodeNumber, channelNumber){
    let name = ""
    try{
      // first look for a user supplied channel name, this will overr-ride any default
      name = state.layout.nodeDetails[nodeNumber].channels[channelNumber].channelName
      if (name.length == 0){ throw "no user channel name" }
    } catch {
      try {
        // attempt to get supplied default name from the MDF, this will over-ride system default
        name = state.nodeDescriptors[nodeNumber].channelNames[channelNumber]
        if (name.length == 0){ throw "no MDF channel name" }
      } catch {
        // otherwise supply system default name
        name = "channel " + channelNumber
      }
    }
    return name
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
      timeStampedLog(name + `: getters.node_group: ${err}`)
      return ""
    }
  },
  node_parameter_name(nodeNumber, parameterIndex){
    var result = 'Index: ' + parameterIndex
    try{
      result = parameterIndex + ': ' + NodeParameterNames[parameterIndex]
    } catch (err) {
      timeStampedLog(name + `: getters.node_parameter_name: ${err}`)
    }
    return result
  },
  node_parameter_value(nodeNumber, parameterIndex){
    var result = undefined
    try{
      result = state.nodes[nodeNumber].parameters[parameterIndex]
    } catch (err) {
      timeStampedLog(name + `: getters: node_parameter_value: ${err}`)
    }
    return result
  }

}

//-----------------------------------------------------------------------------
//  setters
//-----------------------------------------------------------------------------
const setters = {
  //
  // Events
  addEventToLayout(eventIdentifier){
    if (eventIdentifier in state.layout.eventDetails === false) {
      state.layout.eventDetails[eventIdentifier] = {}
      state.layout.eventDetails[eventIdentifier].colour = "black"
      state.layout.eventDetails[eventIdentifier].group = ""
    }
  },
  event_name(eventIdentifier, eventName) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      setters.addEventToLayout(eventIdentifier)
    }
    state.layout.eventDetails[eventIdentifier].name = eventName
    state.update_layout_needed = true
  },
  event_colour(eventIdentifier, eventColour) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      setters.addEventToLayout(eventIdentifier)
    }
    state.layout.eventDetails[eventIdentifier].colour = eventColour
    state.update_layout_needed = true
  },
  event_group(eventIdentifier, eventGroup) {
    if (eventIdentifier in state.layout.eventDetails === false) {
      setters.addEventToLayout(eventIdentifier)
    }
    state.layout.eventDetails[eventIdentifier].group = eventGroup
    state.update_layout_needed = true
  },
  //
  // Nodes
  addNodeToLayout(nodeNumber, moduleIdentifer, moduleName){
    //timeStampedLog(name + `: addNodeToLayout: ${nodeNumber} ${moduleIdentifer} ${moduleName}`)
    if (nodeNumber != undefined){
      if (nodeNumber in state.layout.nodeDetails === false){
        timeStampedLog(name + `: addNodeToLayout: nodeNumber: ${nodeNumber}`)
        state.layout.nodeDetails[nodeNumber] = {}
        state.layout.nodeDetails[nodeNumber].colour = "black"
        state.layout.nodeDetails[nodeNumber].group = ""
        state.update_layout_needed = true
      }
      if (moduleIdentifer != undefined){
        if (state.layout.nodeDetails[nodeNumber].moduleIdentifer != moduleIdentifer){
          timeStampedLog(name + `: addNodeToLayout: moduleIdentifier: ${moduleIdentifer}`)
          state.layout.nodeDetails[nodeNumber].moduleIdentifer = moduleIdentifer
          state.update_layout_needed = true
        }
      }
      if (moduleName != undefined){
        if (state.layout.nodeDetails[nodeNumber].moduleName != moduleName){
          timeStampedLog(name + `: addNodeToLayout: moduleName: ${moduleName}`)
          state.layout.nodeDetails[nodeNumber].moduleName = moduleName
          state.update_layout_needed = true
        }
      }
    }
  },
  node_channel_name(nodeNumber, channelNumber, channelName){
    if (typeof channelNumber === 'string'){
      channelNumber = parseInt(channelNumber)
    }
    if (nodeNumber in state.layout.nodeDetails === false){
      setters.addNodeToLayout(nodeNumber)
    }
    if (state.layout.nodeDetails[nodeNumber].channels == undefined){
      state.layout.nodeDetails[nodeNumber].channels = {}
    }
    state.layout.nodeDetails[nodeNumber].channels[channelNumber] = {channelName: channelName}
    state.update_layout_needed = true
  },
  node_group(nodeNumber, Group){
    if (nodeNumber in state.layout.nodeDetails === false){
      setters.addNodeToLayout(nodeNumber)
    }
    state.layout.nodeDetails[nodeNumber].group = Group
    state.update_layout_needed = true
  },
  node_moduleName(nodeNumber, moduleName){
    if (nodeNumber in state.layout.nodeDetails === false){
      setters.addNodeToLayout(nodeNumber)
    }
    state.layout.nodeDetails[nodeNumber].moduleName = moduleName
    state.update_layout_needed = true
  },
  node_name(nodeNumber, nodeName){
    if (nodeNumber in state.layout.nodeDetails === false){
      setters.addNodeToLayout(nodeNumber)
    }
    state.layout.nodeDetails[nodeNumber].name = nodeName
    state.update_layout_needed = true
  }
}

//-----------------------------------------------------------------------------
//  socket events
//-----------------------------------------------------------------------------
const socket = io(`http://${host}:${port}`)

//
//
socket.on('ARCHIVED_LOGS_LIST', (data) => {
  timeStampedLog(name + `: RECEIVED ARCHIVED_LOGS_LIST`)
  timeStampedLog(name + `: RECEIVED ARCHIVED_LOGS_LIST ${JSON.stringify(data)}`)
  eventBus.emit('ARCHIVED_LOGS_LIST', data)
})

//
//
socket.on('BACKUPS_LIST', (data) => {
  timeStampedLog(name + `: RECEIVED BACKUPS_LIST`)
  state.backups_list = data;
})

//
//
socket.on('BINARY_FILE', (data) => {
  timeStampedLog(name + `: RECEIVED BINARY_FILE ${data.directory} ${data.fileName} length ${data.data.length}`)
  //timeStampedLog(name + `: RECEIVED BINARY_FILE base 64 : ${data.data}`)
  eventBus.emit('BINARY_FILE', data)
})

//
//
socket.on('LIST_OF_BACKUPS_FOR_ALL_NODES', (data) => {
  try{
    timeStampedLog(name + `: RECEIVED LIST_OF_BACKUPS_FOR_ALL_NODES ${JSON.stringify(data)}`)
    for(const node in data){
      // extract node number
      let nodeNumber = node.replace(/[^0-9]/g, "")
      if (nodeNumber != undefined){
        timeStampedLog(name + `: RECEIVED LIST_OF_BACKUPS_FOR_ALL_NODES: node ${nodeNumber}`)
        state.layout.nodeDetails[nodeNumber]['backupList'] = data[node]
      }
    }
    eventBus.emit('LIST_OF_BACKUPS_FOR_ALL_NODES', data)
  } catch(err){
    timeStampedLog(name + `: RECEIVED LIST_OF_BACKUPS_FOR_ALL_NODES: ${err}`)
  }
})

//
//
socket.on('NODE_BACKUP_SAVED', (filename) => {
  timeStampedLog(name + `: RECEIVED NODE_BACKUP_SAVED ${filename}`)
  eventBus.emit('NODE_BACKUP_SAVED', filename)
})

socket.on('NODE_BACKUPS_LIST', (data) => {
  timeStampedLog(name + `: RECEIVED NODE_BACKUPS_LIST`)
  state.backups_list = data;
})

socket.on("BUS_EVENTS", (data) => {
  timeStampedLog(name + `: RECEIVED BUS_EVENTS Data`)
  state.busEvents = data
})

socket.on("CBUS_ERRORS", (data) => {
  timeStampedLog(name + `: RECEIVED CBUS_ERRORS `)
  state.cbus_errors = data
})

socket.on("CBUS_NO_SUPPORT", (data) => {
  timeStampedLog(name + `: RECEIVED CBUS_NO_SUPPORT `)
})

socket.on("CBUS_TRAFFIC", (data) => {
//  timeStampedLog(`RECEIVED CBUS_TRAFFIC`)
  state.cbusTrafficTimeStamp = Date.now()
  state.nodeTraffic.push(data)
  if (state.nodeTraffic.length > 32) {
    state.nodeTraffic.shift()
  }
  eventBus.emit('BUS_TRAFFIC_EVENT', data)
})

socket.on("connect", () => {
  timeStampedLog(`Socket Connect`)
  eventBus.emit('SERVER_CONNECT')
  socket.emit('REQUEST_VERSION')
  socket.emit('REQUEST_LAYOUTS_LIST')
})

socket.on("DCC_ERROR", (data) => {
  timeStampedLog(`RECEIVED DCC_ERROR`)
  state.dcc_errors = data
})

socket.on('DCC_SESSIONS', function (data) {
  timeStampedLog(`RECEIVED DCC_SESSIONS`)
  // timeStampedLog(`CBUS Errors Received:${JSON.stringify(data)}`)
  state.dcc_sessions = data;
})

socket.on('dccSessions', function (data) {
  timeStampedLog(`RECEIVED DCC Sessions`)
  // timeStampedLog(`CBUS Errors Received:${JSON.stringify(data)}`)
  state.dcc_sessions = data;
})

socket.on("disconnect", (data) => {
  timeStampedLog(name + `: disconnect`)
  eventBus.emit('SERVER_DISCONNECT')
})

socket.on("error", (data) => {
  timeStampedLog(name + `: connection error`)
})

socket.on("FIRMWARE_INFO", (data) => {
  timeStampedLog(name + `: FIRMWARE_INFO ${JSON.stringify(data)}`)
  eventBus.emit('FIRMWARE_INFO', data)
})

socket.on('LAYOUT_DATA', (data) => {
  timeStampedLog(name + `: RECEIVED Layout Data`)
  state.layout = data;
  // put a fresh timestamp on it
  state.layout['updateTimestamp'] = Date.now()
  eventBus.emit('LAYOUT_DATA', state.layout)
})

socket.on('LAYOUTS_LIST', (data) => {
  timeStampedLog(name + `: RECEIVED LAYOUTS_LIST`)
  state.layouts_list = data;
})

//
//
socket.on('LOG_FILE', (data) => {
  if ((data.fileName.length > 0) & (data.logFile.length > 0)){
    timeStampedLog(name + `: RECEIVED LOG_FILE ${data.fileName} ${data.logFile.length}`)
    eventBus.emit('LOG_FILE', data.fileName, data.logFile)
  } else {
    timeStampedLog(name + `: RECEIVED unexpected LOG_FILE`)
    timeStampedLog(name + `: RECEIVED unexpected LOG_FILE  ${data.fileName} ${data.logFile.length}`)
  }
})

//
socket.on("MDF_EXPORT", (location, filename, MDF) => {
  timeStampedLog(name + `: RECEIVED MDF_EXPORT ` + location + ' ' + filename)
  state.exported_MDF = MDF
  state.MDFupdateTimestamp = Date.now()
})

socket.on("MATCHING_MDF_LIST", (location, nodeNumber, list) => {
  timeStampedLog(name + `: RECEIVED MATCHING_MDF_LIST ` + nodeNumber + ' ' + location + ' ' + list.length)
  if (state.server.nodes[nodeNumber] == undefined){state.server.nodes[nodeNumber] = {} }
  state.server.nodes[nodeNumber][location + '_MDF_List'] = list
  state.MDFupdateTimestamp = Date.now()
})

//
socket.on("MODULE_NAMES", (data) => {
  timeStampedLog(name + `: RECEIVED MODULE_NAMES`)
  //timeStampedLog(name + `: RECEIVED MODULE_NAMES ${JSON.stringify(data)}`)
  state.moduleNames = data
  state.server["moduleNames"] = data
})

//
//
socket.on("NETWORK_CONNECTION_FAILURE", (data) => {
  timeStampedLog(name + `: RECEIVED NETWORK_CONNECTION_FAILURE : ${JSON.stringify(data)}`)
  eventBus.emit('NETWORK_CONNECTION_FAILURE', data.message, data.caption, data.type, data.timeout)
})

socket.on("NODE", (data) => {
  state.nodes["updateTimestamp"] = Date.now()
  timeStampedLog(name + `: RECEIVED NODE: ${data.nodeNumber}`)
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
    timeStampedLog(name + `: socket.on NODE: ` + err)
  }
})

socket.on("NODES", (data) => {
  state.nodes["updateTimestamp"] = Date.now()
  timeStampedLog(name + ': RECEIVED NODES')
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
    timeStampedLog(name + `: socket.on NODES: ` + err)
  }
})

socket.on("NODE_DESCRIPTOR", (data) => {
  try {
    var nodeNumber = Object.keys(data)[0]   // get first key
    var moduleDescriptor = Object.values(data)[0] // get first value
    timeStampedLog(name + `: RECEIVED NODE_DESCRIPTOR : node ` + nodeNumber + ' ' + moduleDescriptor.moduleDescriptorFilename)
    state.nodeDescriptors[nodeNumber] = moduleDescriptor
    const store = {"state":state}
    state.layout.nodeDetails[nodeNumber].numberOfChannels = getNumberOfChannels(store, nodeNumber)
    state.MDFupdateTimestamp = Date.now()
  } catch (err) {
    timeStampedLog(name + `: RECEIVED NODE_DESCRIPTOR: ${err} `)
  }
})

socket.on("PROGRAM_NODE_PROGRESS", (text) => {
  timeStampedLog(name + `: RECEIVED PROGRAM_NODE_PROGRESS : ` + text)
  eventBus.emit('PROGRAM_NODE_PROGRESS', text)
})

socket.on('RESTORED_DATA', (data) => {
  timeStampedLog(name + `: RECEIVED RESTORED_DATA`)
  state.restoredData = data;
  // put a fresh timestamp on it
  state.restoredData['updateTimestamp'] = Date.now()
})

socket.on("REQUEST_NODE_NUMBER", (nodeNumber, moduleName) => {
  timeStampedLog(name + `: RECEIVED REQUEST_NODE_NUMBER : ` + JSON.stringify(nodeNumber) + ' moduleName ' + moduleName)
  eventBus.emit('REQUEST_NODE_NUMBER_EVENT', nodeNumber, moduleName)
})

//
//
socket.on("SERIAL_CONNECTION_FAILURE", (data) => {
  timeStampedLog(name + `: RECEIVED SERIAL_CONNECTION_FAILURE : ${JSON.stringify(data)}`)
  eventBus.emit('SERIAL_CONNECTION_FAILURE', data.message, data.caption, data.type, data.timeout)
})


socket.on("SERVER_NOTIFICATION", (data) => {
  timeStampedLog(name + `: RECEIVED SERVER_NOTIFICATION : ${JSON.stringify(data)}`)
  eventBus.emit('GENERAL_MESSAGE_EVENT', data.message, data.caption, data.type, data.timeout)
})

socket.on("SERVER_STATUS", (data) => {
  if (data.mode == "RUNNING"){
    state.inStartup = false
  }
  state.serverStatus = data
  eventBus.emit('SERVER_STATUS_EVENT', data)
})

socket.on("VERSION", (data) => {
  timeStampedLog(name + `: RECEIVED VERSION ` + JSON.stringify(data))
  state.version = data
})

export default {
  state,
  methods,
  getters,
  setters,
  eventBus
}
