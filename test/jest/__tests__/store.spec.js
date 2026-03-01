import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';

import * as defaultStore from "../../../src/store/index.js";

const store = defaultStore.default

describe('store Test', () => {


  //
  //
  it('cbusTrafficTimeStamp test', () => {
    console.log (`store ${JSON.stringify(store.state.cbusTrafficTimeStamp)}`)
    expect(store.state.cbusTrafficTimeStamp).toBe(0)
  });

  //
  //
  each([
    [1, 5],
    [2, 6],
    [3, 7]
  ]).test('node_numberOfEvents test %s %s', (nodeNumber, expected) => {
    store.state.nodeDescriptors[1] = { numberOfEvents: 5 }
    store.state.nodes[nodeNumber] = { moduleInfo:{ numberOfEvents: 6 } }
    if (nodeNumber == 3){
      store.state.nodes[3].eventCount = 7
    }
    let result = store.getters.node_numberOfEvents(nodeNumber)
    console.log (`UNIT TEST: node_numberOfEvents: node ${nodeNumber} result ${result}`)
    expect(result).toBe(expected)
  });

  //
  //
  each([
    [11, 8],
    [12, 16]
  ]).test('node_eventCapacity test %s %s', (nodeNumber, expected) => {
    store.state.nodes[nodeNumber] = { moduleInfo:{ numberOfEvents: 8 } }
    if (nodeNumber == 12){
      store.state.nodes[12].parameters = { 4: 16}
    }
    let result = store.getters.node_eventCapacity(nodeNumber)
    console.log (`UNIT TEST: node_eventCapacity: node ${nodeNumber} result ${result}`)
    expect(result).toBe(expected)
  });

  //
  //
  each([
    ["00000001", "red", "red"],
    ["00000001", undefined, "blue"],  // retains colour
    ["00000002", undefined, "black"]
  ]).test('event_colour test %s %s %s', (eventIdentifier, eventColour, expected) => {
    store.state.layout["eventDetails"] = {"00000001": {"colour": "blue"} }
    store.setters.event_colour(eventIdentifier, eventColour)
    let result = store.getters.event_colour(eventIdentifier)
    console.log (`UNIT TEST: event_colour: eventIdentifier ${eventIdentifier} result ${result}`)
    expect(result).toBe(expected)
  });

  //
  //
  each([
    [1, "red", "red"],
    [1, undefined, "blue"],   // retains colour
    [2, undefined, "black"]
  ]).test('node_colour test %s %s %s', (nodeNumber, node_colour, expected) => {
    store.state.layout["nodeDetails"] = {"1": {"colour": "blue"} }
    store.setters.node_colour(nodeNumber, node_colour)
    let result = store.getters.node_colour(nodeNumber)
    console.log (`UNIT TEST: node_colour: nodeNumber ${nodeNumber} result ${result}`)
    expect(result).toBe(expected)
  });



});

