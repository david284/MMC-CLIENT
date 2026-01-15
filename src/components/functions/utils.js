import { setMaxListeners } from "stream"

const name = "utils"

//
// Get every instance of tokens into a list
//
export function getListOfTokens(jsonString){
  try{
    //timeStampedLog(name + `: getListOfTokens: start`)
    let list =[]
    const startToken = "${"
    const endToken = "}"
    var searchIndex = 0
    var indexTokenStart = 0;
    //
    while((indexTokenStart = jsonString.indexOf(startToken, searchIndex)) > 0) {
      //timeStampedLog(name + `: getListOfTokens: indexTokenStart = ${indexTokenStart}`)
      searchIndex = indexTokenStart + 1   // move searchIndex on
      //
      // look for next '}' - must be a final '}' if valid json, so should always get a value for this
      let indexTokenEnd = jsonString.indexOf(endToken, indexTokenStart)
      //timeStampedLog(name + `: getNextToken: indexTokenEnd ${indexTokenEnd}`)
      //
      // check that the next '}' is in the actual field, which should be contained within quote marks
      // so look for next string quote mark, as that should be the end of the token value
      let endOfField = jsonString.indexOf('"', searchIndex)
      if (endOfField > 0){
        // a quote mark should follow the ending '}' - e.g. "${chaNNel1} green"
        // if quote mark is before this ending char, then ending char missing, so skip
        // if endOfField == -1, then not found, so don't run this test (should never happen)
        if (indexTokenEnd > endOfField) {
          timeStampedLog(name + `: missing ending token - skipping ${indexTokenEnd} ${endOfField}` )
          continue
        }
      }
      // ok, if we get here, then we must have a valid token sequence
      let token = jsonString.substring(indexTokenStart, indexTokenEnd + 1)
      //timeStampedLog(name + `: getListOfTokens: token ${token} : ${indexTokenStart} ${indexTokenEnd}`)
      list.push(token)
    }
    //
    return list
  } catch (err){
    timeStampedLog(name + `: getListOfTokens: ${err}`)
  }
}

//
// get all tokens from json
// then reduce to single instance of each token, plus highest number
// And then check if we already have this token in the layout data
// so that we don't overwrite any existing data
//
export function extractMDFTokens(moduleDescriptor) {
  try {
    //timeStampedLog(name + `: extractMDFTokens:`)
    if (moduleDescriptor != undefined){
      timeStampedLog(name + `: extractMDFTokens: module: ${moduleDescriptor.moduleName}`)
      let jsonString = JSON.stringify(moduleDescriptor)
      let allTokens = getListOfTokens(jsonString)
      //
      // layoutNodeTokens has the following structure
      //    "palette": {
      //      "maxNumber": "12",
      //      "entries": {
      //        "1": {
      //          "name": "dark grey"
      //        ...
      //
//      if (layoutNodeTokens == undefined){ layoutNodeTokens ={} }
      if (moduleDescriptor.tokens == undefined){moduleDescriptor.tokens={}}
      // now go through all the tokens we've found in the MDF to see if we need to update anything
      allTokens.forEach(token => {
        let tokenName = token.replace(/[0-9,$,{,}]/g, '')
        tokenName = tokenName.toLowerCase().trim()
        let tokenNumber = token.replace(/[^0-9]/g, "")
        if (moduleDescriptor.tokens[tokenName] == undefined) {
          moduleDescriptor.tokens[tokenName] = {maxNumber: tokenNumber}
          timeStampedLog(name + `: extractMDFTokens: add ${tokenName} ${tokenNumber}`)
        } else {
          timeStampedLog(name + `: extractMDFTokens: ${tokenName} already exists`)
          // token exists, but need to check if we need to update the maxNumber for this token
          if(moduleDescriptor.tokens[tokenName].maxNumber == undefined){
            moduleDescriptor.tokens[tokenName].maxNumber = tokenNumber}
          if (tokenNumber > moduleDescriptor.tokens[tokenName].maxNumber) {
            moduleDescriptor.tokens[tokenName].maxNumber = tokenNumber}
        }
      })
      return moduleDescriptor.tokens
    }
  } catch (err) {
    timeStampedLog(name + `: extractMDFTokens: ${err}`)
  }
}


//
// usage: import {replaceChannelTokens} from "components/functions/utils.js"
//
// Method:
//   find each instance of channel token and extract channel number
//   Replace with channel name for that node & channel
//
export function replaceChannelTokens(store, jsonObj, nodeNumber) {
  try {
    timeStampedLog(name + `: replaceChannelTokens:`)
    let jsonString = JSON.stringify(jsonObj)
    let allTokens = getListOfTokens(jsonString)
    //
    // now have list of all tokens
    allTokens.forEach(token => {
      // extract channel number
      let tokenNumber = token.replace(/[^0-9]/g, "")
          // get channel name
      if (token.toLowerCase().includes("channel")){
        let channelName = store.getters.node_channel_name(nodeNumber, tokenNumber)
        //timeStampedLog(name + `: replaceChannelTokens: token ${token} name ${channelName}`)
        // now replace full token with channel Name
        //timeStampedLog(name + ":replace " + token + ' with '+ channelName)
        jsonString = jsonString.replace(token, channelName)
      }
    })
    //
    try{
      //timeStampedLog(name + `: END_replaceChannelTokens: node ${nodeNumber}`)
      return JSON.parse(jsonString)
    } catch(err) {
      timeStampedLog(name + ": replaceChannelTokens: parsing result " + err)
    }
    //
  } catch (err){
    timeStampedLog(name + `: replaceChannelTokens: ${err}`)
  }
}

//
// usage: import {replaceDescriptorTokens} from "components/functions/utils.js"
//
// Method:
//   find each instance of token and extract name/number
//   Replace with name for that node & token
//
export function replaceDescriptorTokens(store, jsonObj, nodeNumber) {
  try {
    timeStampedLog(name + `: replaceDescriptorTokens:`)
    let jsonString = JSON.stringify(jsonObj)
    let allTokens = getListOfTokens(jsonString)
    //
    // now have list of all tokens
    allTokens.forEach(token => {
      let tokenName = token.replace(/[0-9,$,{,}]/g, '')
      tokenName = tokenName.toLowerCase().trim()
      // extract channel number
      let tokenNumber = token.replace(/[^0-9]/g, "")
      let replacementName = store.getters.node_token_name(nodeNumber, tokenName, tokenNumber)
      //timeStampedLog(name + `: replaceDescriptorTokens: token ${token} name ${channelName}`)
      // now replace full token with channel Name
      timeStampedLog(name + ":replace " + token + ' with '+ replacementName)
      jsonString = jsonString.replace(token, replacementName)

    })
    //
    try{
      //timeStampedLog(name + `: END_replaceChannelTokens: node ${nodeNumber}`)
      return JSON.parse(jsonString)
    } catch(err) {
      timeStampedLog(name + ": replaceDescriptorTokens: parsing result " + err)
    }
    //
  } catch (err){
    timeStampedLog(name + `: replaceDescriptorTokens: ${err}`)
  }
}

//
// usage: import {sleep} from "components/functions/utils.js"
//
export function sleep(timeout) {
	return new Promise(function (resolve, reject) {
		//here our function should be implemented
		setTimeout(()=>{
			resolve();
			;} , timeout
		);
	});
};


//
// usage: import {sleep} from "components/functions/utils.js"
//
export function secondsNow() {
  var time = new Date()
  var timeStamp = String( String(time.getSeconds()).padStart(2, '0') + '.'
    + String(time.getMilliseconds()).padStart(3, '0'))
	return timeStamp
}

export function decToHex(num, len) {return parseInt(num).toString(16).toUpperCase().padStart(len, '0');}

export function createDateStamp(){
  //create timestamp for filename
  var date = new Date()
  var datestamp = date.getFullYear()  + '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +       // getMonth starts at 0
    date.getDate().toString().padStart(2, '0')
  return datestamp
}

export function createTimeStamp(){
  //create timestamp for filename
  var date = new Date()
  var timestamp = date.getFullYear()  + '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +       // getMonth starts at 0
    date.getDate().toString().padStart(2, '0')  + '_' +
    date.getHours().toString().padStart(2, '0')  + '-' +
    date.getMinutes().toString().padStart(2, '0')  + '-' +
    date.getSeconds().toString().padStart(2, '0') + '.' +
    date.getMilliseconds().toString().padStart(3, '0')
  return timestamp
}

//
// MDF timestamp is of the form..
// "timestamp": "202411092105",
//               012345678901
//
export function TimeStampToText(timestamp){
  //timeStampedLog("TimeStampToText: length " + timestamp.length)
  var text = ''
  if (timestamp != undefined){
    if (timestamp.length >= 12){
      text = timestamp.substring(0,4)     // get year
      text += '/' + timestamp.substring(4,6)  // get month
      text += '/' + timestamp.substring(6,8)  // get day
      text += ' ' + timestamp.substring(8,10)  // get hour
      text += ':' + timestamp.substring(10,12)  // get minutes
    }
    if (timestamp.length >= 14){
      text += ':' + timestamp.substring(12,14)  // get seconds
    }
  }
  return text
}

export function timeStampedLog(text){
  console.log('TS ' + secondsNow() + ': ' + text)
}

//
// adds or removes columnName from visibleColumns array
// depending on enableState
export function setVisibleColumn (visibleColumns, columnName, enableState) {
  let index = visibleColumns.indexOf(columnName)
  if (enableState){
    if (index == -1){
      visibleColumns.push(columnName)
    }
  } else {
    if (index != -1){
      visibleColumns.splice(index, 1)
    }
  }
  //timeStampedLog(name + `: setVisibleColumn: ${visibleColumns}`)
}

//
// convert old style user channel names to new style tokens
// only does this if new style tokens don't yet exist
// ensures it's a one-off operation
export function convertUserChannelNames(state, setters){
  try{
    var nodeList = Object.keys(state.layout.nodeDetails)
    for (const nodeNumber of nodeList){
      if (state.layout.nodeDetails[nodeNumber].tokens == undefined){
        //timeStampedLog(name + `: convertUserChannelNames: ${JSON.stringify(store)}`)
        if (state.layout.nodeDetails[nodeNumber].channels){
          var channelList = Object.keys(state.layout.nodeDetails[nodeNumber].channels)
          for (const channelNumber of channelList){
            //timeStampedLog(name + `: convertUserChannelNames: channelNumber: ${JSON.stringify(channelNumber)}`)
            setters.node_token_name(
              nodeNumber,
              "channel",
              channelNumber,
              state.layout.nodeDetails[nodeNumber].channels[channelNumber].channelName
            )
          }
        }
      }
      // remove tokenList if present (no longer used)
      delete state.layout.nodeDetails[nodeNumber].tokenList
    }
  } catch(error){
    timeStampedLog(name + `: convertUserChannelNames: ${error}`)
  }
}
