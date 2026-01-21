//
// mock store object to avoid unit tests poluting running storage
//
//

export var state = {"layout":{
  "eventDetails":{
    "000A0001": {"name": "event #1"},
    "000A0002": {}
  },
  "nodeDetails":{
  }
}}

export const getters = {
  node_token_name(nodeNumber, tokenName, tokenNumber){
    console.log(`unit_test: node_channel_name ${nodeNumber} ${tokenName} ${tokenNumber}`)
    let replacementName = "undefined"
    return replacementName
  }
}

export const setters = {
  event_name(eventIdentifier, eventName){
    console.log(`unit_test: event_name updated ${event_name_updated}`)
  },
  node_moduleName(nodeNumber, moduleName){
  },
  node_name(nodeNumber, nodeName){
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

