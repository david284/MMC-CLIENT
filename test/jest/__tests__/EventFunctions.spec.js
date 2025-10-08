import { describe, expect, it } from '@jest/globals';
import * as EventFunctions from "components/functions/EventFunctions.js"
import cbusLib from "cbuslibrary"

describe('EventFunctions Test', () => {


  //---------------------------------------------------------------------------
  //  EventFunctions
  //---------------------------------------------------------------------------

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACON(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ACON Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("ON")
  });

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACOF(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ACOF Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("OFF")
  });

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASON(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ASON Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("ON")
  });

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASOF(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ASOF Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("OFF")
  });

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACON3(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ACON3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("ON")
  });

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACOF3(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ACOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("OFF")
  });

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASON3(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ASON3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("ON")
  });

  //
  //
  it('getEventType', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASOF3(1,1))
    let result = EventFunctions.getEventType(cbusMsg)
    console.log(`getEventType ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("OFF")
  });

});


