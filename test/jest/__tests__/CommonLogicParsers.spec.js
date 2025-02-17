import { describe, expect, it } from '@jest/globals';

import {overloadedLabel} from "components/modules/common/CommonLogicParsers.js"

describe('CommonLogicParsers Test', () => {


  let store = {
    "state":{
      "nodes":{"1":{nodeVariables:{72:0}}}
    }
  }

  //---------------------------------------------------------------------------
  //  overloadedLabel
  //---------------------------------------------------------------------------

  //
  // export function overloadedLabel (nodeNumber, element, store)
  //
  it('overloadedLabel test', () => {
    console.log("overloadedLabel")
    const overload = {
      "nv": 72, 
      "labels": [
        {"value": 1, "label": "TRIGGER_INVERTED"},
        {"value": 2, "label": "NORMAL"}
      ]
    }
    let nodenumber = 1
    store.state.nodes[nodenumber].nodeVariables[72] = 1
    let result1 = overloadedLabel(nodenumber, overload, store)
    console.log('overloadedLabel: result1 = ' + result1)
    expect(result1).toBe("TRIGGER_INVERTED")
    store.state.nodes[nodenumber].nodeVariables[72] = 2
    let result2 = overloadedLabel(nodenumber, overload, store)
    console.log('overloadedLabel: result2 = ' + result2)
    expect(result2).toBe("NORMAL")
  });


});

