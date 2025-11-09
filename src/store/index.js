import {reactive} from 'vue'
import io from 'socket.io-client'
//import VueSocketIO from 'vue-socket.io'
import { EventBus } from 'quasar'
import {NodeParameterNames} from "src/definitions/Text_NodeParameterNames"
import * as utils from "components/functions/utils.js"
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
    utils.timeStampedLog(name + `: CHANGE_LAYOUT: ` + JSON.stringify(layoutName))
    socket.emit('CHANGE_LAYOUT', {
      "layoutName": layoutName
    })
  },
  //
  clear_bus_events() {
    socket.emit('CLEAR_BUS_EVENTS')
    utils.timeStampedLog(name + `: CLEAR_BUS_EVENTS`)
  },
  //
  clear_cbus_errors() {
    socket.emit('CLEAR_CBUS_ERRORS')
    utils.timeStampedLog(`CLEAR_CBUS_ERRORS`)
  },
  //
  clear_node_events(nodeNumber) {
    utils.timeStampedLog(`CLEAR_NODE_EVENTS ${nodeNumber}`)
    socket.emit('CLEAR_NODE_EVENTS',{
      "nodeNumber": nodeNumber
    })
  },
  //
  copy_layout(sourceLayout, destinationLayout) {
    let data = {"sourceLayout":sourceLayout, "destinationLayout":destinationLayout}
    socket.emit('COPY_LAYOUT', data)
    utils.timeStampedLog(name + `: COPY_LAYOUT ${JSON.stringify(data)}`)
  },
  //
  delete_all_events(nodeNumber) {
    socket.emit('DELETE_ALL_EVENTS', {
        "nodeNumber": nodeNumber
    })
    utils.timeStampedLog(name + `: DELETE_ALL_EVENTS ${nodeNumber}`)
  },
  //
  delete_layout(layoutName) {
    socket.emit('DELETE_LAYOUT', {
        "layoutName": layoutName
    })
    utils.timeStampedLog(name + `: DELETE_LAYOUT ${layoutName}`)
  },
  //
  delete_node_backup(layoutName, nodeNumber, fileName) {
    utils.timeStampedLog(name + `: DELETE_NODE_BACKUP ${layoutName} ${nodeNumber} ${fileName}`)
    socket.emit('DELETE_NODE_BACKUP', {
        "layoutName": layoutName,
        "nodeNumber":nodeNumber,
        "fileName":fileName
    })
  },
  //
  // reLoad false to surpress reLoading of variables after writing - like when restoring node
  event_teach_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex, eventVariableValue, reLoad, linkedVariableList){
    try{
      let data = {
        "nodeNumber": nodeNumber,
        "eventIdentifier": eventIdentifier,
        "eventVariableIndex": eventVariableIndex,
        "eventVariableValue": parseInt(eventVariableValue),
        "reLoad": reLoad,
        "linkedVariableList": linkedVariableList
      }
      utils.timeStampedLog(name + `: EVENT_TEACH_BY_IDENTIFIER : ${JSON.stringify (data)} `)
      socket.emit('EVENT_TEACH_BY_IDENTIFIER', data)
    } catch (err) {
      utils.timeStampedLog(name + `: EVENT_TEACH_BY_IDENTIFIER : ${err} `)
    }
  },
  //
  // reLoad false to surpress reLoading of variables after writing - like when restoring node
  event_teach_by_index(nodeNumber, eventIdentifier, eventIndex, eventVariableIndex, eventVariableValue, reLoad, linkedVariableList){
    try {
      let data = {
        "nodeNumber": nodeNumber,
        "eventIdentifier": eventIdentifier,
        "eventIndex": eventIndex,
        "eventVariableIndex": eventVariableIndex,
        "eventVariableValue": parseInt(eventVariableValue),
        "reLoad": reLoad,
        "linkedVariableList": linkedVariableList
      }
      utils.timeStampedLog(name + `: EVENT_TEACH_BY_INDEX : ${JSON.stringify (data)} `)
      socket.emit('EVENT_TEACH_BY_INDEX', data)
      // lets store this against the node in the layout
      // as the index is specific to the node
      setters.addIndexedEventToLayoutNode(nodeNumber, eventIndex, eventIdentifier)
    } catch (err) {
      utils.timeStampedLog(name + `: EVENT_TEACH_BY_INDEX : ${err} `)
    }
  },
  //
  import_module_descriptor(nodeNumber, moduleDescriptor) {
    utils.timeStampedLog(`import_module_descriptor : ` + moduleDescriptor.moduleDescriptorFilename)
    socket.emit('IMPORT_MODULE_DESCRIPTOR', {"nodeNumber":nodeNumber, "moduleDescriptor":moduleDescriptor})
  },
  //
  long_on_event(nodeNumber, eventNumber){
    utils.timeStampedLog(`ACON ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_LONG_ON', {
      "nodeNumber": nodeNumber,
      "eventNumber": eventNumber
    })
  },
  //
  long_off_event(nodeNumber, eventNumber){
    utils.timeStampedLog(`ACOF ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_LONG_OFF', {
      "nodeNumber": nodeNumber,
      "eventNumber": eventNumber
    })
  },
  //
  node_can_id_enum(nodeNumber){
    utils.timeStampedLog(name + `: CANID_ENUM : ` + nodeNumber)
    socket.emit('CANID_ENUM', nodeNumber)
  },
  //
  program_node(nodeNumber, cpuType, flags, hexFile) {
    utils.timeStampedLog(name + `: PROGRAM_NODE : node: ${nodeNumber} hexfile: ${hexFile.name}`)
    socket.emit('PROGRAM_NODE', {
      "nodeNumber": nodeNumber,
      "cpuType": cpuType,
      "flags": flags,
      "hexFile": hexFile
    })
  },
  //
  query_all_nodes() {
    utils.timeStampedLog(`QUERY_ALL_NODES`)
    socket.emit('QUERY_ALL_NODES')
  },
  //
  remove_event(nodeNumber, eventName, eventIndex) {
    utils.timeStampedLog(name + `: remove_event: ${nodeNumber} ${eventName} ${eventIndex}`)
    try {
    delete state.layout.nodeDetails[nodeNumber].indexedEvents[eventIndex]
    } catch(err){ utils.timeStampedLog(name + `: remove_event: ${err}`) }
    utils.timeStampedLog(name + `: remove_event: ${JSON.stringify(state.layout.nodeDetails[nodeNumber].indexedEvents, null, " ")} `)
    utils.timeStampedLog(name + `: REMOVE_EVENT`)
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
    utils.timeStampedLog(name + ': sent REMOVE_NODE ' + nodeNumber)
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
    utils.timeStampedLog(name + ': sent RENAME_NODE_BACKUP ' + JSON.stringify(data))
  },
  //
  requestAllEventVariablesForNode(nodeNumber) {
    socket.emit('REQUEST_ALL_EVENT_VARIABLES_FOR_NODE', {
      "nodeNumber": nodeNumber
    })
    utils.timeStampedLog(`REQUEST_ALL_EVENT_VARIABLES_FOR_NODE: node ` + nodeNumber)
  },
  //
  request_archived_logs_list() {
    utils.timeStampedLog(`REQUEST_ARCHIVED_LOGS_LIST :`)
    socket.emit('REQUEST_ARCHIVED_LOGS_LIST')
  },
  //
  request_binary_file(directory, fileName) {
    utils.timeStampedLog(`REQUEST_BINARY_FILE : ` + directory + ' ' + fileName)
    socket.emit('REQUEST_BINARY_FILE', {"directory":directory, "fileName":fileName})
  },
  //
  request_diagnostics(nodeNumber, serviceIndex) {
    if (serviceIndex == undefined){serviceIndex = 0;}
    utils.timeStampedLog(`Request Service Diagnostics : node ` + nodeNumber + ' Service Index ' + serviceIndex )
    socket.emit('REQUEST_DIAGNOSTICS', {"nodeNumber":nodeNumber, "serviceIndex":serviceIndex})
  },
  //
  request_all_node_parameters(nodeNumber, parameters, delay) {
    socket.emit('REQUEST_ALL_NODE_PARAMETERS', {"nodeNumber": nodeNumber, "parameters": parameters, "delay": delay})
    utils.timeStampedLog(`REQUEST_ALL_NODE_PARAMETERS`)
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
    utils.timeStampedLog(`REQUEST_ALL_NODE_VARIABLES: node ` + nodeNumber)
  },
  //
  refresh_bus_events() {
    socket.emit('REQUEST_BUS_EVENTS')
    utils.timeStampedLog(name + `: REQUEST_BUS_EVENTS`)
  },
  //
  request_firmware_info(file) {
    utils.timeStampedLog(`REQUEST_FIRMWARE_INFO : ` + file.name)
    socket.emit('REQUEST_FIRMWARE_INFO', file)
  },

  //
  request_log_file(filename) {
    utils.timeStampedLog(`REQUEST_LOG_FILE : ` + filename)
    socket.emit('REQUEST_LOG_FILE', {"fileName":filename})
  },
  //
  request_MDF_delete(filename, nodeNumber) {
    utils.timeStampedLog(`REQUEST_MDF_DELETE : ${filename} ${nodeNumber}`)
    socket.emit('REQUEST_MDF_DELETE', {"filename":filename, "nodeNumber":nodeNumber})
  },
  //
  request_MDF_export(location, filename) {
    utils.timeStampedLog(`REQUEST_MDF_EXPORT : ` + location + ' ' + filename)
    socket.emit('REQUEST_MDF_EXPORT', {"location":location, "filename":filename})
  },
  //
  request_node_backup(layoutName, nodeNumber, filename) {
    utils.timeStampedLog(`REQUEST_NODE_BACKUP : ` + layoutName + ' ' + nodeNumber + ' ' + filename)
    socket.emit('REQUEST_NODE_BACKUP', {"layoutName":layoutName, "nodeNumber":nodeNumber, "fileName":filename})
  },
  //
  request_node_backups_list(layoutName, nodeNumber) {
    utils.timeStampedLog(`REQUEST_NODE_BACKUPS_LIST : ` + layoutName)
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
    utils.timeStampedLog(name + `: REQUEST_ALL_NODE_EVENTS ${nodeNumber}`)
  },
  //
  request_all_node_events_by_index(nodeNumber, numberOfEvents) {
    let data = {"nodeNumber": nodeNumber, "numberOfEvents":numberOfEvents}
    socket.emit('REQUEST_ALL_NODE_EVENTS_BY_INDEX', data)
    utils.timeStampedLog(name + `: REQUEST_ALL_NODE_EVENTS_BY_INDEX ${JSON.stringify(data)}`)
  },
  //
  request_node_event_by_index(nodeNumber, eventIndex) {
    socket.emit('REQUEST_NODE_EVENT_BY_INDEX', {"nodeNumber": nodeNumber, "eventIndex":eventIndex})
    utils.timeStampedLog(name + `: REQUEST_NODE_EVENT_BY_INDEX ${nodeNumber} ${eventIndex}`)
  },
  //
  request_event_variables_by_identifier(nodeNumber, eventIdentifier) {
    let data = { "nodeNumber": nodeNumber, "eventIdentifier": eventIdentifier }
    utils.timeStampedLog(name + `: REQUEST_EVENT_VARIABLES_BY_IDENTIFIER: nodeNumber: ${JSON.stringify(data)}`)
    socket.emit(`REQUEST_EVENT_VARIABLES_BY_IDENTIFIER`, data)
  },
  //
  request_event_variables_by_index(nodeNumber, eventIndex) {
    let data = { "nodeNumber": nodeNumber, "eventIndex": eventIndex }
    utils.timeStampedLog(name + `: REQUEST_EVENT_VARIABLES_BY_INDEX: nodeNumber: ${JSON.stringify(data)}`)
    socket.emit(`REQUEST_EVENT_VARIABLES_BY_INDEX`, data)
  },
  //
  request_service_discovery(nodeNumber) {
    utils.timeStampedLog(`Request Service Discovery : ` + nodeNumber)
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
    utils.timeStampedLog(name + `: request_layout_list:`)
    socket.emit('REQUEST_LAYOUTS_LIST')
  },
  //
  request_matching_mdf_list(nodeNumber, location) {
    utils.timeStampedLog(name + ': REQUEST_MATCHING_MDF_LIST: ' + location)
    if (state.server.nodes[nodeNumber] == undefined){state.server.nodes[nodeNumber] = {} }
    state.server.nodes[nodeNumber][location + '_MDF_List'] = []
    socket.emit('REQUEST_MATCHING_MDF_LIST', {"nodeNumber":nodeNumber, "location":location})
  },
  //
  reset_node(nodeNumber) {
    socket.emit('RESET_NODE', nodeNumber)
    utils.timeStampedLog(name + ': RESET_NODE ' + nodeNumber)
  },
  //
  save_logs_archive(){
    utils.timeStampedLog(`SAVE_LOGS_ARCHIVE`)
    socket.emit('SAVE_LOGS_ARCHIVE')
  },
  //
  save_node_backup(nodeNumber, backupNode){
    utils.timeStampedLog(`SAVE_NODE_BACKUP`)
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
    utils.timeStampedLog(name + `: SEND_CBUS_MESSAGE: ${message}` )
  },
  //
  set_can_id(nodeNumber, CAN_ID){
    var data = {}
    data['nodeNumber'] = nodeNumber
    data['CAN_ID'] = CAN_ID
    socket.emit('SET_CAN_ID', data)
    utils.timeStampedLog(name + `: SET_CAN_ID: node ` + JSON.stringify(data))
  },
  //
  STOP_SERVER(nodeNumber) {
    socket.emit('STOP_SERVER')
    utils.timeStampedLog(`STOP SERVER`)
    window.close()
  },
  //
  set_node_number(nodeNumber){
    utils.timeStampedLog(name + `: emit SET_NODE_NUMBER ${nodeNumber}`)
    socket.emit('SET_NODE_NUMBER', nodeNumber)
  },
  //
  short_on_event(nodeNumber, eventNumber){
    utils.timeStampedLog(`ASON ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_ON', {
      "nodeNumber": nodeNumber,
      "deviceNumber": eventNumber
    })
  },
  //
  short_off_event(nodeNumber, eventNumber){
    utils.timeStampedLog(`ASOF ${nodeNumber} : ${eventNumber}`)
    socket.emit('ACCESSORY_SHORT_OFF', {
      "nodeNumber": nodeNumber,
      "deviceNumber": eventNumber
    })
  },
  //
  start_connection(data) {
    utils.timeStampedLog(name + `: start_connection : ` + JSON.stringify(data))
    socket.emit('START_CONNECTION', data)
  },
  //
  update_layout() {
    try{
      utils.timeStampedLog(`Update Layout Data : ` + state.layout.layoutDetails.title)
      //utils.timeStampedLog(`Update Layout Data : ` + JSON.stringify(state.layout))
      socket.emit('UPDATE_LAYOUT_DATA', state.layout)
    } catch {}
  },
  //
  // reLoad is a flag to indicate if node variable(s) need to be read back
  // we don't want to read any back if doing bulk programming (e.g. restoring a node)
  //
  update_node_variable(nodeNumber, nodeVariableIndex, nodeVariableValue, reLoad, linkedVariableList) {
    utils.timeStampedLog(name + `: update_node_variable: ${nodeNumber} ${nodeVariableIndex} ${nodeVariableValue} ${reLoad} ${JSON.stringify(linkedVariableList)}`)
    state.nodes[nodeNumber].nodeVariables[nodeVariableIndex] = nodeVariableValue
    if (reLoad != false){reLoad = true}
    let data = {
      "nodeNumber": nodeNumber,
      "variableId": nodeVariableIndex,
      "variableValue": parseInt(nodeVariableValue),
      "reLoad":reLoad,
      "linkedVariableList": linkedVariableList
    }
    //utils.timeStampedLog(`NVsetNeedsLearnMode : ` + JSON.stringify(state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode))
    if((state.nodeDescriptors[nodeNumber])
        && (state.nodeDescriptors[nodeNumber].NVsetNeedsLearnMode)){
          //utils.timeStampedLog(name + `: Update Node Variable in learn mode: ${nodeNumber} ${nodeVariableIndex} ${nodeVariableValue} ${reLoad}`)
          socket.emit('UPDATE_NODE_VARIABLE_IN_LEARN_MODE', data)
    } else {
      //utils.timeStampedLog(name + `: Update Node Variable: ${nodeNumber} ${nodeVariableIndex} ${nodeVariableValue} ${reLoad}`)
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
      //utils.timeStampedLog(`Event Name`)
      return state.layout.eventDetails[eventIdentifier].colour
    } else {
      setters.event_colour(eventIdentifier, "black")
      //utils.timeStampedLog(`Event No Name ${JSON.stringify(eventIdentifier)}`)
      return "black"
    }
  },
  event_group(eventIdentifier) {
    if (eventIdentifier in state.layout.eventDetails) {
      //utils.timeStampedLog(`Event Name`)
      return state.layout.eventDetails[eventIdentifier].group
    } else {
      setters.event_group(eventIdentifier, "")
      //utils.timeStampedLog(`Event No Name ${JSON.stringify(eventIdentifier)}`)
      return ""
    }
  },
  //
  event_variable_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex){
    //utils.timeStampedLog(name + `: event_variable_by_identifier: ${nodeNumber} ${eventIdentifier} ${eventVariableIndex}`)
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
  node_descriptor_useEventIndex(nodeNumber){
    try{
      if ( state.nodeDescriptors[nodeNumber].useEventIndex == true ){
        utils.timeStampedLog(name + `: node_descriptor_useEventIndex: true`)
        return true
      } else{
        // anything else is false
        utils.timeStampedLog(name + `: node_descriptor_useEventIndex: false`)
        return false
      }
    } catch{
      return false
    }
  },
  node_descriptor_useNENRD(nodeNumber){
    try{
      return state.nodeDescriptors[nodeNumber].useNENRD
    } catch{
      return false
    }
  },
  node_descriptor_useSwitchTeach1(nodeNumber){
    try{
      return state.nodeDescriptors[nodeNumber].useSwitchTeach1
    } catch{
      return false
    }
  },
  //
  node_descriptor_numberOfEvents(nodeNumber){
    try{
      utils.timeStampedLog(name + `: node_descriptor_numberOfEvents ${state.nodeDescriptors[nodeNumber].events.numberOfEvents}`)
      return state.nodeDescriptors[nodeNumber].numberOfEvents
    } catch{
      return 0
    }
  },
  //
  node_can_id(nodeNumber){
    var CAN_ID = undefined
    try{
      CAN_ID = state.nodes[nodeNumber].CANID
    } catch (err){
      utils.timeStampedLog(name + `: getters.node_can_id: ${err}`)
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
      utils.timeStampedLog(name + `: getters.node_name: ${err}`)
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
      utils.timeStampedLog(name + `: getters.node_group: ${err}`)
      return ""
    }
  },
  node_parameter_name(nodeNumber, parameterIndex){
    var result = 'Index: ' + parameterIndex
    try{
      result = parameterIndex + ': ' + NodeParameterNames[parameterIndex]
    } catch (err) {
      utils.timeStampedLog(name + `: getters.node_parameter_name: ${err}`)
    }
    return result
  },
  node_parameter_value(nodeNumber, parameterIndex){
    var result = undefined
    try{
      result = state.nodes[nodeNumber].parameters[parameterIndex]
    } catch (err) {
      utils.timeStampedLog(name + `: getters: node_parameter_value: ${err}`)
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
  //
  // Events
  addIndexedEventToLayoutNode(nodeNumber, eventIndex, eventIdentifier){
    try{
      utils.timeStampedLog(name + `: setters: addIndexedEventToLayoutNode: ${nodeNumber} ${eventIndex} ${eventIdentifier}`)
      if (state.layout.nodeDetails[nodeNumber] != undefined){
        if (state.layout.nodeDetails[nodeNumber].indexedEvents == undefined){
          state.layout.nodeDetails[nodeNumber].indexedEvents = {}
        }
        state.layout.nodeDetails[nodeNumber].indexedEvents[eventIndex] = {"eventIndex": eventIndex, "eventIdentifier": eventIdentifier}
        state.update_layout_needed = true
      }
    } catch (err){
      utils.timeStampedLog(name + `: setters: addIndexedEventToLayoutNode: ${err}`)
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
    //utils.timeStampedLog(name + `: addNodeToLayout: ${nodeNumber} ${moduleIdentifer} ${moduleName}`)
    if (nodeNumber != undefined){
      if (nodeNumber in state.layout.nodeDetails === false){
        utils.timeStampedLog(name + `: addNodeToLayout: nodeNumber: ${nodeNumber}`)
        state.layout.nodeDetails[nodeNumber] = {}
        state.layout.nodeDetails[nodeNumber].colour = "black"
        state.layout.nodeDetails[nodeNumber].group = ""
        state.update_layout_needed = true
      }
      if (moduleIdentifer != undefined){
        if (state.layout.nodeDetails[nodeNumber].moduleIdentifer != moduleIdentifer){
          utils.timeStampedLog(name + `: addNodeToLayout: moduleIdentifier: ${moduleIdentifer}`)
          state.layout.nodeDetails[nodeNumber].moduleIdentifer = moduleIdentifer
          state.update_layout_needed = true
        }
      }
      if (moduleName != undefined){
        if (state.layout.nodeDetails[nodeNumber].moduleName != moduleName){
          utils.timeStampedLog(name + `: addNodeToLayout: moduleName: ${moduleName}`)
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
  utils.timeStampedLog(name + `: RECEIVED ARCHIVED_LOGS_LIST`)
  utils.timeStampedLog(name + `: RECEIVED ARCHIVED_LOGS_LIST ${JSON.stringify(data)}`)
  eventBus.emit('ARCHIVED_LOGS_LIST', data)
})

//
//
socket.on('BACKUPS_LIST', (data) => {
  utils.timeStampedLog(name + `: RECEIVED BACKUPS_LIST`)
  state.backups_list = data;
})

//
//
socket.on('BINARY_FILE', (data) => {
  utils.timeStampedLog(name + `: RECEIVED BINARY_FILE ${data.directory} ${data.fileName} length ${data.data.length}`)
  //utils.timeStampedLog(name + `: RECEIVED BINARY_FILE base 64 : ${data.data}`)
  eventBus.emit('BINARY_FILE', data)
})

//
//
socket.on('LIST_OF_BACKUPS_FOR_ALL_NODES', (data) => {
  try{
    utils.timeStampedLog(name + `: RECEIVED LIST_OF_BACKUPS_FOR_ALL_NODES ${JSON.stringify(data)}`)
    for(const node in data){
      // extract node number
      let nodeNumber = node.replace(/[^0-9]/g, "")
      if (nodeNumber != undefined){
        utils.timeStampedLog(name + `: RECEIVED LIST_OF_BACKUPS_FOR_ALL_NODES: node ${nodeNumber}`)
        state.layout.nodeDetails[nodeNumber]['backupList'] = data[node]
      }
    }
    eventBus.emit('LIST_OF_BACKUPS_FOR_ALL_NODES', data)
  } catch(err){
    utils.timeStampedLog(name + `: RECEIVED LIST_OF_BACKUPS_FOR_ALL_NODES: ${err}`)
  }
})

//
//
socket.on('NODE_BACKUP_SAVED', (filename) => {
  utils.timeStampedLog(name + `: RECEIVED NODE_BACKUP_SAVED ${filename}`)
  eventBus.emit('NODE_BACKUP_SAVED', filename)
})

socket.on('NODE_BACKUPS_LIST', (data) => {
  utils.timeStampedLog(name + `: RECEIVED NODE_BACKUPS_LIST`)
  state.backups_list = data;
})

socket.on("BUS_EVENTS", (data) => {
  utils.timeStampedLog(name + `: RECEIVED BUS_EVENTS Data`)
  state.busEvents = data
})

socket.on("CBUS_ERRORS", (data) => {
  utils.timeStampedLog(name + `: RECEIVED CBUS_ERRORS `)
  state.cbus_errors = data
})

socket.on("CBUS_NO_SUPPORT", (data) => {
  utils.timeStampedLog(name + `: RECEIVED CBUS_NO_SUPPORT `)
})

socket.on("CBUS_TRAFFIC", (data) => {
//  utils.timeStampedLog(`RECEIVED CBUS_TRAFFIC`)
  state.cbusTrafficTimeStamp = Date.now()
  state.nodeTraffic.push(data)
  if (state.nodeTraffic.length > 32) {
    state.nodeTraffic.shift()
  }
  eventBus.emit('BUS_TRAFFIC_EVENT', data)
})

socket.on("connect", () => {
  utils.timeStampedLog(`Socket Connect`)
  eventBus.emit('SERVER_CONNECT')
  socket.emit('REQUEST_VERSION')
  socket.emit('REQUEST_LAYOUTS_LIST')
})

socket.on("DCC_ERROR", (data) => {
  utils.timeStampedLog(`RECEIVED DCC_ERROR`)
  state.dcc_errors = data
})

socket.on('DCC_SESSIONS', function (data) {
  utils.timeStampedLog(`RECEIVED DCC_SESSIONS`)
  // utils.timeStampedLog(`CBUS Errors Received:${JSON.stringify(data)}`)
  state.dcc_sessions = data;
})

socket.on('dccSessions', function (data) {
  utils.timeStampedLog(`RECEIVED DCC Sessions`)
  // utils.timeStampedLog(`CBUS Errors Received:${JSON.stringify(data)}`)
  state.dcc_sessions = data;
})

socket.on("disconnect", (data) => {
  utils.timeStampedLog(name + `: disconnect`)
  eventBus.emit('SERVER_DISCONNECT')
})

socket.on("error", (data) => {
  utils.timeStampedLog(name + `: connection error`)
})

socket.on("FIRMWARE_INFO", (data) => {
  utils.timeStampedLog(name + `: FIRMWARE_INFO ${JSON.stringify(data)}`)
  eventBus.emit('FIRMWARE_INFO', data)
})

socket.on('LAYOUT_DATA', (data) => {
  utils.timeStampedLog(name + `: RECEIVED Layout Data`)
  state.layout = data;
  // put a fresh timestamp on it
  state.layout['updateTimestamp'] = Date.now()
  eventBus.emit('LAYOUT_DATA', state.layout)
})

socket.on('LAYOUTS_LIST', (data) => {
  utils.timeStampedLog(name + `: RECEIVED LAYOUTS_LIST`)
  state.layouts_list = data;
})

//
//
socket.on('LOG_FILE', (data) => {
  if ((data.fileName.length > 0) & (data.logFile.length > 0)){
    utils.timeStampedLog(name + `: RECEIVED LOG_FILE ${data.fileName} ${data.logFile.length}`)
    eventBus.emit('LOG_FILE', data.fileName, data.logFile)
  } else {
    utils.timeStampedLog(name + `: RECEIVED unexpected LOG_FILE`)
    utils.timeStampedLog(name + `: RECEIVED unexpected LOG_FILE  ${data.fileName} ${data.logFile.length}`)
  }
})

//
socket.on("MDF_EXPORT", (location, filename, MDF) => {
  utils.timeStampedLog(name + `: RECEIVED MDF_EXPORT ` + location + ' ' + filename)
  state.exported_MDF = MDF
  state.MDFupdateTimestamp = Date.now()
})

socket.on("MATCHING_MDF_LIST", (location, nodeNumber, list) => {
  utils.timeStampedLog(name + `: RECEIVED MATCHING_MDF_LIST ` + nodeNumber + ' ' + location + ' ' + list.length)
  if (state.server.nodes[nodeNumber] == undefined){state.server.nodes[nodeNumber] = {} }
  state.server.nodes[nodeNumber][location + '_MDF_List'] = list
  state.MDFupdateTimestamp = Date.now()
})

//
socket.on("MODULE_NAMES", (data) => {
  utils.timeStampedLog(name + `: RECEIVED MODULE_NAMES`)
  //utils.timeStampedLog(name + `: RECEIVED MODULE_NAMES ${JSON.stringify(data)}`)
  state.moduleNames = data
  state.server["moduleNames"] = data
})

//
//
socket.on("NETWORK_CONNECTION_FAILURE", (data) => {
  utils.timeStampedLog(name + `: RECEIVED NETWORK_CONNECTION_FAILURE : ${JSON.stringify(data)}`)
  eventBus.emit('NETWORK_CONNECTION_FAILURE', data.message, data.caption, data.type, data.timeout)
})

socket.on("NODE", (data) => {
  state.nodes["updateTimestamp"] = Date.now()
  utils.timeStampedLog(name + `: RECEIVED NODE: ${data.nodeNumber}`)
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
    utils.timeStampedLog(name + `: socket.on NODE: ` + err)
  }
})

socket.on("NODES", (data) => {
  state.nodes["updateTimestamp"] = Date.now()
  utils.timeStampedLog(name + ': RECEIVED NODES')
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
    utils.timeStampedLog(name + `: socket.on NODES: ` + err)
  }
})

socket.on("NODE_DESCRIPTOR", (data) => {
  try {
    var nodeNumber = Object.keys(data)[0]   // get first key
    var moduleDescriptor = Object.values(data)[0] // get first value
    utils.timeStampedLog(name + `: RECEIVED NODE_DESCRIPTOR : node ` + nodeNumber + ' ' + moduleDescriptor.moduleDescriptorFilename)
    state.nodeDescriptors[nodeNumber] = moduleDescriptor
    const store = {"state":state}
    state.layout.nodeDetails[nodeNumber].numberOfChannels = getNumberOfChannels(store, nodeNumber)
    state.MDFupdateTimestamp = Date.now()
  } catch (err) {
    utils.timeStampedLog(name + `: RECEIVED NODE_DESCRIPTOR: ${err} `)
  }
})

socket.on("PROGRAM_NODE_PROGRESS", (text) => {
  utils.timeStampedLog(name + `: RECEIVED PROGRAM_NODE_PROGRESS : ` + text)
  eventBus.emit('PROGRAM_NODE_PROGRESS', text)
})

socket.on('RESTORED_DATA', (data) => {
  utils.timeStampedLog(name + `: RECEIVED RESTORED_DATA`)
  state.restoredData = data;
  // put a fresh timestamp on it
  state.restoredData['updateTimestamp'] = Date.now()
})

socket.on("REQUEST_NODE_NUMBER", (nodeNumber, moduleName) => {
  utils.timeStampedLog(name + `: RECEIVED REQUEST_NODE_NUMBER : ` + JSON.stringify(nodeNumber) + ' moduleName ' + moduleName)
  eventBus.emit('REQUEST_NODE_NUMBER_EVENT', nodeNumber, moduleName)
})

//
//
socket.on("SERIAL_CONNECTION_FAILURE", (data) => {
  utils.timeStampedLog(name + `: RECEIVED SERIAL_CONNECTION_FAILURE : ${JSON.stringify(data)}`)
  eventBus.emit('SERIAL_CONNECTION_FAILURE', data.message, data.caption, data.type, data.timeout)
})


socket.on("SERVER_NOTIFICATION", (data) => {
  utils.timeStampedLog(name + `: RECEIVED SERVER_NOTIFICATION : ${JSON.stringify(data)}`)
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
  utils.timeStampedLog(name + `: RECEIVED VERSION ` + JSON.stringify(data))
  state.version = data
})

export default {
  state,
  methods,
  getters,
  setters,
  eventBus
}
