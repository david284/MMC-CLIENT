const name = "utils"


//
// usage: import {replaceChannelTokens} from "components/functions/utils.js"
//
// Method:
//   find each instance of channel token and extract channel number
//   Replace with channel name for that node & channel
//
export function replaceChannelTokens(store, jsonObj, nodeNumber) {
  let jsonString = JSON.stringify(jsonObj)
  let result = null
  var searchIndex = 0
  var indexTokenStart = 0;
  var startToken = "${channel"
  var endToken = "}"
  console.log(secondsNow() + ': ' + name + `: BEGIN_replaceChannelTokens: node ${nodeNumber}`)
  while((indexTokenStart = jsonString.toLowerCase().indexOf(startToken, searchIndex)) > 0) {
    searchIndex = indexTokenStart + 1
    // look for next '}'
    // it's not valid JSON if there isn't a final '}', so should always get a value for this
    let indexTokenEnd = jsonString.indexOf(endToken, indexTokenStart)
    //
    // check that the next '}' is in the actual field, which should be contained within quote marks
    // so look for next string quote mark, as that should be the end of the token value
    let endOfField = jsonString.indexOf('"', searchIndex)
    if (endOfField > 0){
      // if quote mark is before this ending char, then ending char missing, so skip
      // if endOfField == -1, then not found, so don't run this test (should never happen)
      if (indexTokenEnd > endOfField) {
        console.log(name + `: missing ending token - skipping ${indexTokenEnd} ${endOfField}` )
        continue
      }
    }
    // ok, if we get here, then we must have a valid token sequence
    let channelToken = jsonString.substring(indexTokenStart, indexTokenEnd + 1)
    // extract channel number
    let channelNumber = channelToken.replace(/[^0-9]/g, "")
    // get channel name
    let channelName = store.getters.node_channel_name(nodeNumber, channelNumber)
    //console.log(name + ":channelName " + channelName)
    // now replace full token with channel Name
    //console.log(name + ":replace " + channelToken + ' with '+ channelName)
    jsonString = jsonString.replace(channelToken, channelName)
  }
  try{
    result = JSON.parse(jsonString)
  } catch(err) {
    console.log(name + ": replaceChannelTokens: " + err)
  }
  console.log(secondsNow() + ': ' + name + `: END_replaceChannelTokens: node ${nodeNumber}`)
	return result
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
  //console.log("TimeStampToText: length " + timestamp.length)
  var text = ''
  if (timestamp.length == 12){
    text = timestamp.substring(0,4)     // get year
    text += '/' + timestamp.substring(4,6)  // get month
    text += '/' + timestamp.substring(6,8)  // get day
    text += ' ' + timestamp.substring(8,10)  // get hour
    text += ':' + timestamp.substring(10,12)  // get minutes
  }
  return text
}


