import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';

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
        if (nodeNumber == 1){return false}
        if (nodeNumber == 2){return true}
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
        mock_store.mock_store_is_called = true
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
        mock_store.mock_store_is_called = true
      }
    },
    mock_store_is_called: false
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
    expect(result).toEqual(3)
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
  each([
  [1, "identifier"],
  [2, "index"]
  ]).test('eventTeach test %s %s', async (nodeNumber, expected) => {
    utils.timeStampedLog(name + `: eventTeach: node ${nodeNumber} expected ${expected}`)
    mock_store.mock_store_is_called = false
    let result = EventFunctions.eventTeach(
      mock_store,
      nodeNumber,       // nodeNumber,
      "00000002",       // eventIdentifier,
      3,                // eventIndex,
      4,                // eventVariableIndex,
      5,                // eventVariableValue,
      true,             // reload
      {"linkedVariables": {"EV": [ 20, 21] } },       // configuration
    )
    expect(mock_store.mock_store_is_called).toEqual(true)
    expect(result).toEqual(expected)
  });


  //
  //
  each([
    [1, "00000001", 1],
    [2, "00000002", 2]
  ]).test('restoreEventVariables test %s %s', async (nodeNumber, eventIdentifier, eventIndex) => {
    console.log (`UNIT TEST: BEGIN restoreEventVariables:`)
    mock_store.mock_store_is_called = false
    let eventVariables = {"1":100, "2":200, "3":300, "4":400}
    let result = await EventFunctions.restoreEventVariables(
      mock_store,
      nodeNumber,
      eventIdentifier,
      eventIndex,
      eventVariables)
    console.log (`UNIT TEST: restoreEventVariables: node ${nodeNumber} result ${result}`)
    expect(mock_store.mock_store_is_called).toEqual(true)
    expect(result).toEqual(true)
    console.log (`UNIT TEST: END restoreEventVariables:`)
  });


});


