import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';
import * as utils from "components/functions/utils.js"

import * as logic from "components/modules/common/mdfLogic.js";

let name = "UNIT TEST"

describe('mfdLogic Test', () => {

  let myLogic = new logic.mdfLogic()

  let store = {
    state:{
      nodes:{
        "1":{
          parameters:[],
          nodeVariables:[],
          storedEventsNI:{}
        }
      }
    }
  }


  //---------------------------------------------------------------------------
  // event variable logic
  //---------------------------------------------------------------------------
  store.state.nodes[1].storedEventsNI['11112222'] = {
    "eventIdentifier": "11112222",
    "variables": { "0": 3, "1": 5, "2": 4, "3": 3 }
  }

  //
  //
  each([
    [{ "==" : [ {"EV" : [2]}, 4] }, true],
    [{ "==" : [ {"ev" : [2]}, 4] }, true],
    [{ "==" : [ {"EV" : [3]}, 4] }, false]
  ]).test('EVparse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: EVparse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + " EVparse test END")
  });

  //
  //
  each([
    [{ "==" : [ {"EVbit" : [1, 0]}, true] }, true],
    [{ "==" : [ {"EVbit" : [3, 3]}, true] }, false]
  ]).test('EVbitParse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: EVbitParse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + " EVbitParse test END")
  });

  //---------------------------------------------------------------------------
  // node parameter logic
  //---------------------------------------------------------------------------
  store.state.nodes[1].parameters[1] = 7
  store.state.nodes[1].parameters[2] = 1


  //
  //
  each([
    [{ "==" : [ {"NP" : [1]}, 7] }, true],
    [{ "==" : [ {"NP" : [1]}, 8] }, false]
  ]).test('NPparse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NPparse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + " NPparse test END")
  });

  //
  //
  each([
    [{ "==" : [ {"NPbit" : [1, 2]}, true] }, true],
    [{ "==" : [ {"NPbit" : [2, 1]}, true] }, false]
  ]).test('NPbitParse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NPbitParse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + " NPbitParse test END")
  });

  //---------------------------------------------------------------------------
  // node variable logic
  //---------------------------------------------------------------------------
  store.state.nodes[1].nodeVariables[1] = 9
  store.state.nodes[1].nodeVariables[2] = 1

  //
  //
  each([
    [{ "==" : [ {"NV" : [1]}, 9] }, true],
    [{ "==" : [ {"nv" : [1]}, 9] }, true],
    [{ "==" : [ {"NV" : [1]}, 8] }, false]
  ]).test('NVparse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NVparse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + `: NVparse test END`)
  });


  //
  //
  each([
    [{ "==" : [ {"NVbit" : [1, 3]}, true] }, true],
    [{ "==" : [ {"NVbit" : [1, 2]}, true] }, false]
  ]).test('NVbit test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: NVbit test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(expected)
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
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(true)
  });


  store.state.nodes[1].storedEventsNI['11112222'] = {
    "eventIdentifier": "11112222",
    "variables": { "0": 3, "1": 5, "2": 4, "3": 3 }
  }

  store.state.nodes[1].nodeVariables[5] = 7

  // EV1 = 5
  // NV5 = 7
  //
  each([
    [{ "in" : [ { "NV": {"EV" : 1}}, [5,6,7] ] }, true],
    [{ "in" : [ { "NV": {"EV" : 1}}, [5,6] ] }, false]
  ]).test('DH_parse test %s %s', (expression, expected) => {
    utils.timeStampedLog (name + `: DH_parse test BEGIN ${JSON.stringify(expression)} ${expected}`)
    let nodeNumber = 1
    expect(myLogic.evaluate(store, nodeNumber, expression, '11112222')).toBe(expected)
    utils.timeStampedLog (name + `: DH_parse test END`)
  });


});

