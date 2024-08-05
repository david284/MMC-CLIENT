
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



