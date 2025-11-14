import { setMaxListeners } from "stream"

const name = "utils"

//
// Get every instance of tokens into a list
//
export function getListOfTokens(jsonString){
  try{
    timeStampedLog(name + `: getListOfTokens: start`)
    let list =[]
    const startToken = "${"
    const endToken = "}"
    var searchIndex = 0
    var indexTokenStart = 0;
    //
    while((indexTokenStart = jsonString.indexOf(startToken, searchIndex)) > 0) {
      timeStampedLog(name + `: getListOfTokens: indexTokenStart = ${indexTokenStart}`)
      searchIndex = indexTokenStart + 1   // move searchIndex on
      //
      // look for next '}' - must be a final '}' if valid json, so should always get a value for this
      let indexTokenEnd = jsonString.indexOf(endToken, indexTokenStart)
      timeStampedLog(name + `: getNextToken: indexTokenEnd ${indexTokenEnd}`)
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
      timeStampedLog(name + `: getListOfTokens: token ${token} : ${indexTokenStart} ${indexTokenEnd}`)
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
//
export function extractMDFTokens(store, jsonObj) {
  try {
    timeStampedLog(name + `: extractMDFTokens:`)
    let jsonString = JSON.stringify(jsonObj)
    let allTokens = getListOfTokens(jsonString)
    //
    //

    let list = []
    allTokens.forEach(token => {
      let tokenName = token.replace(/[0-9,$,{,}]/g, '')
      let tokenNumber = token.replace(/[^0-9]/g, "")
      timeStampedLog(name + `: extractMDFTokens: tokenName ${tokenName} tokenNumber ${tokenNumber}`)
      let i = list.find(({ name }) => name === tokenName.toLowerCase());
      timeStampedLog(name + `: extractMDFTokens: find ${JSON.stringify(i)}`)
      if (i == undefined) {
        list.push({name:tokenName.toLowerCase(), number: tokenNumber})
      } else {
        if (tokenNumber > i.number) {i.number = tokenNumber}
      }
    })
    return list
    //
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
        timeStampedLog(name + `: replaceChannelTokens: token ${token} name ${channelName}`)
        // now replace full token with channel Name
        //timeStampedLog(name + ":replace " + token + ' with '+ channelName)
        jsonString = jsonString.replace(token, channelName)
      }
    })
    //
    try{
      timeStampedLog(name + `: END_replaceChannelTokens: node ${nodeNumber}`)
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
  timeStampedLog(name + `: setVisibleColumn: ${visibleColumns}`)
}

