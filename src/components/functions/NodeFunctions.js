
import * as utils from "components/functions/utils.js"


const name = "NodeFunctions"

export function getNumberOfChannels(store, nodeNumber) {
  let numberOfChannels = 0
  // first, try the MDF, if there is one
  try {
    numberOfChannels = store.state.nodeDescriptors[nodeNumber].numberOfChannels
    if (numberOfChannels == undefined){ numberOfChannels = 0 }
  } catch {
    //console.log(name + `: failed to get numberOfChannels`)
  }
  try {
    let maxChannel = 0
    let MDF_ChannelIndexes = Object.keys(store.state.nodeDescriptors[nodeNumber].channelNames)
    MDF_ChannelIndexes.forEach(index => {
      if (parseInt(index) > maxChannel)(maxChannel = parseInt(index))
      //console.log(name + `: index ${index} maxChannel ${maxChannel}`)
    })
    if (maxChannel > numberOfChannels){numberOfChannels = maxChannel}
  } catch (err) {
    //console.log(name + `: failed to get channelNames`)
  }
  // if result still null or zero, then see if we've stored a previous value
  if ((numberOfChannels == null) || (numberOfChannels == 0)){
    try{
      numberOfChannels = store.state.layout.nodeDetails[nodeNumber].numberOfChannels
    } catch {
      //console.log(name + `: failed to get stored numberOfChannels`)
    }
  }
  //utils.timeStampedLog(name + `: numberOfChannels: ${numberOfChannels}`)
  return numberOfChannels
}

//
// Get the higest number associated with a token name for this node
// pick the higest value of either the MDF or the layoutData for this node
//
export function getMaxNumberForToken(store, nodeNumber, token) {
  utils.timeStampedLog(name + `: getMaxNumberForToken: ${nodeNumber} ${token}`)
  let maxNumber = 0
  let highestUserNumber = 0
  try{
    // get the highest number from the MDF
    maxNumber = store.state.nodeDescriptors[nodeNumber].tokens[token].maxNumber
  } catch{
      utils.timeStampedLog(name + `: getMaxNumberForToken: no MDF number`)
  }
  try{
    // now work out the higest number from the user names
    let obj = store.state.layout.nodeDetails[nodeNumber].tokens[token].userNames
    //utils.timeStampedLog(name + `: getMaxNumberForToken: obj ${JSON.stringify(store.state.layout.nodeDetails[nodeNumber].tokens[token])}`)
    Object.entries(obj).forEach(([key, value]) => {
      console.log(`${key}: ${value}`)
      let num = parseInt(key)
      if (highestUserNumber < num) { highestUserNumber = num}
    })
    if (maxNumber < highestUserNumber ){maxNumber = highestUserNumber}
  } catch{
          utils.timeStampedLog(name + `: getMaxNumberForToken: no user number`)
  }
  return maxNumber
}

//
//Parameters collected on startup
// 1 - ManufacturerID
// 2 - Minor version
// 3 - ModuleID
// ....
// 7 - Major version
// 8 - flags
// 9 - CpuType
// so check that 4,5 & 6 are also loaded to be sure it's fully loaded
//
export function NodeParametersLoaded(store, nodeNumber) {
  // logical and '&&'
  if( (store.state.nodes[nodeNumber].parameters[4] != undefined)
    && (store.state.nodes[nodeNumber].parameters[5] != undefined)
    && (store.state.nodes[nodeNumber].parameters[6] != undefined)
  ){
    return true
  } else {
    utils.timeStampedLog(name + `:  NodeParametersLoaded node ${nodeNumber} false
        ${store.state.nodes[nodeNumber].parameters[4]} :
        ${store.state.nodes[nodeNumber].parameters[5]} :
        ${store.state.nodes[nodeNumber].parameters[6]}`)
    return false
  }
}



