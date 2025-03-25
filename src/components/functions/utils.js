
const name = "utils"


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


