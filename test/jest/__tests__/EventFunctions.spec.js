import { describe, expect, it } from '@jest/globals';
import * as EventFunctions from "components/functions/EventFunctions.js"
import * as utils from "components/functions/utils.js"
import cbusLib from "cbuslibrary"

let name = "UNIT TEST"

  let mock_store = {
    "state":{
      nodes:{
        "1":{ parameters:{"4": 5} },
        "2":{ parameters:{"4": 5} }
      },
      nodeDescriptors:{"1":{ events:{numberOfEvents: 3}}}
    },
    "getters":{
      node_numberOfEvents(nodeNumber){
        utils.timeStampedLog(name + `: node_numberOfEvents: ${nodeNumber}`)
        if (nodeNumber == 1){return 3}
        if (nodeNumber == 2){return 9}
      },
      node_useEventIndex(nodeNumber){
        return mock_store.useEventIndex
      }
    },
    "methods":{
      request_all_node_events_by_index(nodeNumber, numberOfEvents){
        utils.timeStampedLog(name + `: request_all_node_events_by_index: ${nodeNumber} ${numberOfEvents}`)
      },
      event_teach_by_identifier(nodeNumber, eventIdentifier, eventVariableIndex, eventVariableValue, reLoad, linkedVariableList){
        let data = {
          "nodeNumber": nodeNumber,
          "eventIdentifier": eventIdentifier,
          "eventVariableIndex": eventVariableIndex,
          "eventVariableValue": parseInt(eventVariableValue),
          "reLoad": reLoad,
          "linkedVariableList": linkedVariableList
        }
        utils.timeStampedLog(name + `: EVENT_TEACH_BY_IDENTIFIER : ${JSON.stringify (data, null, " ")} `)
        mock_store.mock_store_result = true
      },
      event_teach_by_index(nodeNumber, eventIdentifier, eventIndex, eventVariableIndex, eventVariableValue, reLoad, linkedVariableList){
        let data = {
          "nodeNumber": nodeNumber,
          "eventIdentifier": eventIdentifier,
          "eventIndex": eventIndex,
          "eventVariableIndex": eventVariableIndex,
          "eventVariableValue": parseInt(eventVariableValue),
          "reLoad": reLoad,
          "linkedVariableList": linkedVariableList
        }
        utils.timeStampedLog(name + `: event_teach_by_index : ${JSON.stringify (data, null, " ") } `)
        mock_store.mock_store_result = true
      }
    },
    mock_store_result: false,
    useEventIndex: false
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
    utils.timeStampedLog(name + `: requestAllEventsByIndex_1`)
    let result = EventFunctions.requestAllEventsByIndex(mock_store, 1)
    utils.timeStampedLog(`requestAllEventsByIndex_1 Result: ${JSON.stringify(result)}`)
    expect(result).toEqual(5)
  });

  //
  //
  it('requestAllEventsByIndex_2', () => {
    utils.timeStampedLog(name + `: requestAllEventsByIndex`)
    let result = EventFunctions.requestAllEventsByIndex(mock_store, 2)
    //utils.timeStampedLog(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result).toEqual(9)
  });

  //
  //
  it('getNumberOfIndexedEvents', () => {
    utils.timeStampedLog(name + `: getNumberOfIndexedEvents`)
    let result = EventFunctions.getNumberOfIndexedEvents(mock_store, 2)
    //utils.timeStampedLog(`getEventDetails ASOF3 Result: ${JSON.stringify(result)}`)
    expect(result).toEqual(9)
  });

  //
  //
  it('eventTeach_1', () => {
    mock_store.mock_store_result = false
    mock_store.useEventIndex = false
    utils.timeStampedLog(name + `: eventTeach_1`)
    let result = EventFunctions.eventTeach(
      mock_store,
      1,                // nodeNumber,
      "00000002",       // eventIdentifier,
      3,                // eventIndex,
      4,                // eventVariableIndex,
      5,                // eventVariableValue,
      true,             // reload
      {"linkedVariables": {"EV": [ 20, 21] } },       // configuration
    )
    expect(mock_store.mock_store_result).toEqual(true)
  });

  //
  //
  it('eventTeach_2', () => {
    mock_store.mock_store_result = false
    mock_store.useEventIndex = true
    utils.timeStampedLog(name + `: eventTeach_2`)
    let result = EventFunctions.eventTeach(
      mock_store,
      1,                // nodeNumber,
      "00000002",       // eventIdentifier,
      3,                // eventIndex,
      4,                // eventVariableIndex,
      5,                // eventVariableValue,
      true,             // reload
      {"linkedVariables": {"EV": [ 20, 21] } },       // configuration
    )
    expect(mock_store.mock_store_result).toEqual(true)
  });

});


