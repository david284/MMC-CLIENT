import { describe, expect, it } from '@jest/globals';
import * as EventFunctions from "components/functions/EventFunctions.js"
import * as utils from "components/functions/utils.js"
import cbusLib from "cbuslibrary"

let name = "UNIT TEST"

  let store = {
    "state":{
      "nodeDescriptors":{"1":{ "events":{"numberOfEvents": 3}}}
    },
    "methods":{
      request_node_event_by_index(nodeNumber, eventIndex){
      utils.timeStampedLog(name + `: request_node_event_by_index: ${nodeNumber} ${eventIndex}`)
      }
    }
  }


describe('EventFunctions Test', () => {


  //---------------------------------------------------------------------------
  //  EventFunctions
  //---------------------------------------------------------------------------

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACON(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ACON Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACOF(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ACOF Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASON(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ASON Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASOF(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ASOF Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACON3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ACON3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeACOF3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ACOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("LONG")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASON3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ASON3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("ON")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeASOF3(1,1))
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual("SHORT")
    expect(result.state).toEqual("OFF")
  });

  //
  //
  it('getEventDetails', () => {
    let cbusMsg = cbusLib.decode(cbusLib.encodeQNN())
    let result = EventFunctions.getEventDetails(cbusMsg)
    utils.timeStampedLog(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result.type).toEqual(undefined)
    expect(result.state).toEqual(undefined)
  });

  //
  //
  it('requestAllEventsByIndex', () => {
    utils.timeStampedLog(name + `: requestAllEventsByIndex`)
    EventFunctions.requestAllEventsByIndex(store, 1)
    //utils.timeStampedLog(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    //expect(result.type).toEqual(undefined)
    //expect(result.state).toEqual(undefined)
  });

});


