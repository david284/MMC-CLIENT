
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




