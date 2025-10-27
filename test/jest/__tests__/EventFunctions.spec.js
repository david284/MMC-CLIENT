import { describe, expect, it } from '@jest/globals';
import * as EventFunctions from "components/functions/EventFunctions.js"
import * as utils from "components/functions/utils.js"
import cbusLib from "cbuslibrary"

let name = "UNIT TEST"

  let store = {
    "state":{
      "nodeDescriptors":{"1":{ "events":{"numberOfEvents": 3}}}
    },
    "getters":{
      node_descriptor_numberOfEvents(nodeNumber){
        if (nodeNumber == 1){return 3}
        if (nodeNumber == 2){return 9}
      }
    },
    "methods":{
      request_all_node_events_by_index(nodeNumber, numberOfEvents){
      utils.timeStampedLog(name + `: request_all_node_events_by_index: ${nodeNumber} ${numberOfEvents}`)
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
  it('requestAllEventsByIndex_1', () => {
    utils.timeStampedLog(name + `: requestAllEventsByIndex`)
    let result = EventFunctions.requestAllEventsByIndex(store, 1)
    //utils.timeStampedLog(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result).toEqual(8)
  });

  //
  //
  it('requestAllEventsByIndex_2', () => {
    utils.timeStampedLog(name + `: requestAllEventsByIndex`)
    let result = EventFunctions.requestAllEventsByIndex(store, 2)
    //utils.timeStampedLog(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result).toEqual(9)
  });

});


