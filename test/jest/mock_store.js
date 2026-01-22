//
// mock store object to avoid unit tests poluting running storage
//
//

export var state = {
  "layout":{
    "eventDetails":{},
    "nodeDetails":{}
  },
  event_name_updated: false,
  node_name_updated: false,
  node_moduleName_updated: false
}

export const getters = {
  node_token_name(nodeNumber, tokenName, tokenNumber){
    console.log(`unit_test: node_channel_name ${nodeNumber} ${tokenName} ${tokenNumber}`)
    let replacementName = "undefined"
    return replacementName
  }
}

export const setters = {
  event_name(eventIdentifier, eventName){
    console.log(`unit_test: event_name updated ${state.event_name_updated}`)
    if (state.layout.eventDetails[eventIdentifier] == undefined) {state.layout.eventDetails[eventIdentifier] = {}}
    state.layout.eventDetails[eventIdentifier].name = eventName
    state.event_name_updated = true
  },
  node_moduleName(nodeNumber, moduleName){
    if (state.layout.nodeDetails[nodeNumber] == undefined) {state.layout.nodeDetails[nodeNumber] = {}}
    state.layout.nodeDetails[nodeNumber].moduleName = moduleName
    state.node_moduleName_updated = true
  },
  node_name(nodeNumber, nodeName){
    if (state.layout.nodeDetails[nodeNumber] == undefined) {state.layout.nodeDetails[nodeNumber] = {}}
    state.layout.nodeDetails[nodeNumber].name = nodeName
    state.node_name_updated = true
  },
  node_token_name(nodeNumber, token, channelNumber, name){
    console.log(`unit_test: setter: node_token_name: ${nodeNumber} ${token} ${channelNumber} ${name}`)
    if (state.layout.nodeDetails[nodeNumber] == undefined) {state.layout.nodeDetails[nodeNumber] = {}}
    if (state.layout.nodeDetails[nodeNumber].tokens == undefined) {state.layout.nodeDetails[nodeNumber].tokens = {}}
    if (state.layout.nodeDetails[nodeNumber].tokens[token] == undefined) {state.layout.nodeDetails[nodeNumber].tokens[token] = {}}
    if (state.layout.nodeDetails[nodeNumber].tokens[token].userNames == undefined) {state.layout.nodeDetails[nodeNumber].tokens[token].userNames = {}}
    state.layout.nodeDetails[nodeNumber].tokens[token].userNames[channelNumber]=name
  }
}

