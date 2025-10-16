import { describe, expect, it } from '@jest/globals';

import * as logic from "components/modules/common/mdfLogic.js";

describe('mfdLogic Test', () => {

  let myLogic = new logic.mdfLogic()

  var node = {}
  node.parameters = []
  node.nodeVariables = []
  node.storedEventsNI = {}

  //---------------------------------------------------------------------------
  // event variable logic
  //---------------------------------------------------------------------------
  node.storedEventsNI['11112222'] = {
    "eventIdentifier": "11112222",
    "variables": { "0": 3, "1": 5, "2": 4, "3": 3 }
  }

  it('EVparse_true', () => {
    let expression = { "==" : [ {"EV" : [2]}, 4] }
    expect(myLogic.evaluate(node, expression, '11112222')).toBe(true)
  });

  it('evparse_true', () => {
    let expression = { "==" : [ {"ev" : [2]}, 4] }
    expect(myLogic.evaluate(node, expression, '11112222')).toBe(true)
  });

  it('EVparse_false', () => {
    let expression = { "==" : [ {"EV" : [3]}, 4] }
    expect(myLogic.evaluate(node, expression, '11112222')).toBe(false)
  });

  it('EVbitParse_true', () => {
    let expression = { "==" : [ {"EVbit" : [1, 0]}, true] }
    expect(myLogic.evaluate(node, expression, '11112222')).toBe(true)
  });

  it('EVbitParse_false', () => {
    let expression = { "==" : [ {"EVbit" : [3, 3]}, true] }
    expect(myLogic.evaluate(node, expression, '11112222')).toBe(false)
  });


  //---------------------------------------------------------------------------
  // node parameter logic
  //---------------------------------------------------------------------------
  node.parameters[1] = 7
  node.parameters[2] = 1

  it('NPparse_true', () => {
    let expression = { "==" : [ {"NP" : [1]}, 7] }
    expect(myLogic.evaluate(node, expression)).toBe(true)
  });


  it('NPparse_false', () => {
    let expression = { "==" : [ {"NP" : [1]}, 8] }
    expect(myLogic.evaluate(node, expression)).toBe(false)
  });


  it('NPbitParse_true', () => {
    let expression = { "==" : [ {"NPbit" : [1, 2]}, true] }
    expect(myLogic.evaluate(node, expression)).toBe(true)
  });


  it('NPbitParse_false', () => {
    let expression = { "==" : [ {"NPbit" : [2, 1]}, true] }
    expect(myLogic.evaluate(node, expression)).toBe(false)
  });


  //---------------------------------------------------------------------------
  // node variable logic
  //---------------------------------------------------------------------------
  node.nodeVariables[1] = 9
  node.nodeVariables[2] = 1

  it('NVparse_true', () => {
    let expression = { "==" : [ {"NV" : [1]}, 9] }
    expect(myLogic.evaluate(node, expression)).toBe(true)
  });


  it('NVparse_false', () => {
    let expression = { "==" : [ {"NV" : [1]}, 8] }
    expect(myLogic.evaluate(node, expression)).toBe(false)
  });


  it('NVbitParse_true', () => {
    let expression = { "==" : [ {"NVbit" : [1, 3]}, true] }
    expect(myLogic.evaluate(node, expression)).toBe(true)
  });


  it('NVbitParse_false', () => {
    let expression = { "==" : [ {"NVbit" : [1, 2]}, true] }
    expect(myLogic.evaluate(node, expression)).toBe(false)
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
    expect(myLogic.evaluate(node, expression)).toBe(true)
  });


  node.storedEventsNI['11112222'] = {
    "eventIdentifier": "11112222",
    "variables": { "0": 3, "1": 5, "2": 4, "3": 3 }
  }

  node.nodeVariables[5] = 7

// EV1 = 5
// NV5 = 7
//
  it('DH_parse_true', () => {
    let expression = { "in" : [ { "NV": {"EV" : 1}}, [5,6,7] ] }
    expect(myLogic.evaluate(node, expression, '11112222')).toBe(true)
  });

  // EV1 = 5
  // NV5 = 7
  //
  it('DH_parse_false', () => {
    let expression = { "in" : [ { "NV": {"EV" : 1}}, [5,6] ] }
    expect(myLogic.evaluate(node, expression, '11112222')).toBe(false)
  });


});

