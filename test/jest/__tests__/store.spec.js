import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';

import * as store from "../../../src/store/index.js";

describe('store Test', () => {


  //
  //
  it('cbusTrafficTimeStamp test', () => {
    console.log (`store ${JSON.stringify(store.default.state.cbusTrafficTimeStamp)}`)
    expect(store.default.state.cbusTrafficTimeStamp).toBe(0)
  });

  //
  //
  each([
    [1, 5],
    [2, 6],
    [3, 7]
  ]).test('node_numberOfEvents test %s %s', (nodeNumber, expected) => {
    store.default.state.nodeDescriptors[1] = { numberOfEvents: 5 }
    store.default.state.nodes[nodeNumber] = { moduleInfo:{ numberOfEvents: 6 } }
    if (nodeNumber == 3){
      store.default.state.nodes[3].eventCount = 7
    }
    let result = store.default.getters.node_numberOfEvents(nodeNumber)
    console.log (`UNIT TEST: node_numberOfEvents: node ${nodeNumber} result ${result}`)
    expect(result).toBe(expected)
  });

  //
  //
  each([
    [11, 8],
    [12, 16]
  ]).test('node_eventCapacity test %s %s', (nodeNumber, expected) => {
    store.default.state.nodes[nodeNumber] = { moduleInfo:{ numberOfEvents: 8 } }
    if (nodeNumber == 12){
      store.default.state.nodes[12].parameters = { 4: 16}
    }
    let result = store.default.getters.node_eventCapacity(nodeNumber)
    console.log (`UNIT TEST: node_eventCapacity: node ${nodeNumber} result ${result}`)
    expect(result).toBe(expected)
  });

});

