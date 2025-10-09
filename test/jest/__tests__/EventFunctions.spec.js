import { describe, expect, it } from '@jest/globals';
import * as EventFunctions from "components/functions/EventFunctions.js"
import cbusLib from "cbuslibrary"

describe('EventFunctions Test', () => {


  //---------------------------------------------------------------------------
  //  EventFunctions
  //---------------------------------------------------------------------------

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACON(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ACON Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACOF(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ACOF Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASON(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ASON Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASOF(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ASOF Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACON3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ACON3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACOF3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ACOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASON3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ASON3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASOF3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeQNN())
    let result = EventFunctions.getEventDetails(cbusMsg)
    console.log(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual(undefined)
    expect(result.state).toEqual(undefined)
  });

});


