
const name = "CommonFunctions"


function getBitMask(startBit, endBit){
  // work out a bit mask from start and ened bits
  var bitMask = 0;
  for (var i=startBit; i<=endBit; i++){
    bitMask += 1<<i;
  }
  return bitMask
}

//
// Works out a bit mask using the start & end bits
// Takes a new value, shifts it to the startBit position, so the value lies in the bitmask
// then uses the bitmask to set & clear bits in the supplied byteVariable
// return the result
//

export function getDisplayValue (byteVariable, scaling, offset, startBit, endBit) {
//  console.log (name + ": getDisplayValue: input")

  // work out a bit mask from start and end bits if both present
  if ((startBit != undefined) && (endBit != undefined)){
    var bitMask = getBitMask(startBit, endBit)
  } else { 
    startBit = 0
    bitMask = 0xFF
  }
  console.log (name + ": getDisplayValue: bitMask: "  + bitMask)

  if (scaling == undefined){scaling = 1}
  if (offset == undefined){offset = 0}

  let processedValue = byteVariable              // take copy to change
  processedValue = processedValue & bitMask      // clear bits not in bit mask
  processedValue = processedValue >> startBit    // shift according to start bit

  // now do scaling & offset
  processedValue = processedValue * scaling
  processedValue = processedValue + offset

  return processedValue
}



export function  setByteVariable (byteVariable, newValue, scaling, offset, startBit, endBit) {
  console.log (name + ": setByteVariable: ")

  // work out a bit mask from start and end bits if both present
  if ((startBit != undefined) && (endBit != undefined)){
    var bitMask = getBitMask(startBit, endBit)
  } else { 
    bitMask = 0xFF
  }
  if (scaling == undefined){scaling = 1}
  if (offset == undefined){offset = 0}

  let newByteVariable = byteVariable              // take copy to change

  // start by removing offset
  let processedValue = newValue - offset
  // now remove scaling, but ensure the result is an integer
  processedValue = Math.round(newValue/scaling)
  // ok, offset & scaling removed, now adjust position according to startBit
  processedValue = processedValue << startBit       // shift to position in variable
  //
  //set & clear bits in actual variable, but only if they match bits in the bitmask
  newByteVariable = newByteVariable | (processedValue & bitMask)							// set bit by 'or-ing' bit value
  newByteVariable = newByteVariable & (processedValue | ~bitMask)							// clear bit by 'and-ing' inverse bit value

  return newByteVariable
}





