import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';
import * as utils from "components/functions/utils.js"

import * as logic from "components/modules/common/mdfLogic.js";

let name = "UNIT TEST"

describe('mfdLogic Test', () => {

  let myLogic = new logic.mdfLogic()

  let nodeNumber = 1

  // create mock store structure
  let mock_store = {
    state:{
      nodes:{
        "1":{
          parameters:{"1":7, "2": 1},
          nodeVariables:{"1":9, "2":1, "5":7},
          eventsByIndex:{
            "2":{
              eventindex: 2,
              eventIdentifier: "11112222",
              variables: { "0": 1, "1": 2, "2": 6, "3": 7 }
            }
          },
          storedEventsNI:{
            '11112222':{
              eventIdentifier: "11112222",
              variables: { "0": 3, "1": 5, "2": 4, "3": 3 }
            }
          }
        }
      }
    },
    "getters":{
      node_useEventIndex(nodeNumber){
        //utils.timeStampedLog (name + `: node_useEventIndex  ${mock_store.useEventIndex}`)
        return mock_store.useEventIndex
      }
    },
    useEventIndex: false
  }

  //---------------------------------------------------------------------------
  // event variable logic
  //---------------------------------------------------------------------------

  //
  //
  each([
    [{ "==" : [ {"EV" : [2]}, 4] }, true],
    [{ "==" : [ {"ev" : [2]}, 4] }, true],
    [{ "==" : [ {"EV" : [3]}, 4] }, false]
  ]).test('EVparse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: EVparse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + ": EVparse test END")
  });

  //
  //
  each([
    [{ "==" : [ {"EV" : [2]}, 6] }, true],
    [{ "==" : [ {"ev" : [2]}, 6] }, true],
    [{ "==" : [ {"EV" : [3]}, 9] }, false]
  ]).test('indexedEV test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: indexedEV test BEGIN ${JSON.stringify(expression)} ${expected}`)
    mock_store.useEventIndex = true
    let eventIndex = 2
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222', eventIndex)).toBe(expected)
    mock_store.useEventIndex = false
    utils.timeStampedLog (name + ": indexedEV test END")
  });

  //
  // EV1 is 5 - bits 0 & 2
  // EV3 is 3 - bits 0 & 1
  each([
    [{ "==" : [ {"EVbit" : [1, 2]}, true] }, true],
    [{ "==" : [ {"EVbit" : [3, 3]}, true] }, false]
  ]).test('EVbitParse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: EVbitParse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + ": EVbitParse test END")
  });

  //
  // indexed EV1 is 2
  // indexed EV3 is 7
  each([
    [{ "==" : [ {"EVbit" : [1, 1]}, true] }, true],
    [{ "==" : [ {"EVbit" : [3, 4]}, true] }, false]
  ]).test('indexedEVbit test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: indexedEVbit test BEGIN ${JSON.stringify(expression)} ${expected}`)
    mock_store.useEventIndex = true
    let eventIndex = 2
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222', eventIndex)).toBe(expected)
    mock_store.useEventIndex = false
    utils.timeStampedLog (name + ": indexedEVbit test END")
  });

  //---------------------------------------------------------------------------
  // event index logic
  //---------------------------------------------------------------------------

  //
  //
  each([
    [{ "==" : [ {"index":null}, 4] }, true],
    [{ "==" : [ {"index":null}, 5] }, false]
  ]).test('INDEX test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: INDEX test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let eventIndex = 4
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222', eventIndex)).toBe(expected)
    utils.timeStampedLog (name + ": INDEX test END")
  });


  //---------------------------------------------------------------------------
  // node parameter logic
  //---------------------------------------------------------------------------

  //
  //
  each([
    [{ "==" : [ {"NP" : [1]}, 7] }, true],
    [{ "==" : [ {"NP" : [1]}, 8] }, false]
  ]).test('NPparse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NPparse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + ": NPparse test END")
  });

  //
  //
  each([
    [{ "==" : [ {"NPbit" : [1, 2]}, true] }, true],
    [{ "==" : [ {"NPbit" : [2, 1]}, true] }, false]
  ]).test('NPbitParse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NPbitParse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + ": NPbitParse test END")
  });

  //---------------------------------------------------------------------------
  // node variable logic
  //---------------------------------------------------------------------------

  //
  //
  each([
    [{ "==" : [ {"NV" : [1]}, 9] }, true],
    [{ "==" : [ {"nv" : [1]}, 9] }, true],
    [{ "==" : [ {"NV" : [1]}, 8] }, false]
  ]).test('NVparse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NVparse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + `: NVparse test END`)
  });


  //
  //
  each([
    [{ "==" : [ {"NVbit" : [1, 3]}, true] }, true],
    [{ "==" : [ {"NVbit" : [1, 2]}, true] }, false]
  ]).test('NVbit test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NVbit test BEGIN ${JSON.stringify(expression)} ${expected}`)
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + `: NVbit test END`)
  });


  //---------------------------------------------------------------------------
  // Nested logic
  //---------------------------------------------------------------------------

  it('Nested_parse_true', () => {
    let expression = {
      "and" : [
        { "==" : [ {"NP" : [1]}, 7] },
        { "==" : [ {"NV" : [2]}, 1] }
      ]
    }
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(true)
  });

  // EV1 = 5
  // NV5 = 7
  //
  each([
    [{ "in" : [ { "NV": {"EV" : 1}}, [5,6,7] ] }, true],
    [{ "in" : [ { "NV": {"EV" : 1}}, [5,6] ] }, false]
  ]).test('DH_parse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: DH_parse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    expect(myLogic.evaluate(mock_store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + `: DH_parse test END`)
  });


});

