import { describe, expect, it } from '@jest/globals';

import {getNumberOfChannels} from "components/functions/NodeFunctions.js"

describe('NodeFunctions Test', () => {

  var event_name_updated = false
  var node_name_updated = false
  var node_moduleName_updated = false

  let store = {
    "state":{
      "nodeDescriptors":{
        "1":{}
      },
      "layout":{
        "nodeDetails":{
          "1":{}
        }
      }
    }
  }

  //---------------------------------------------------------------------------
  //  NodeFunctions
  //---------------------------------------------------------------------------

  //
  // use number of channels in MDF
  // store.state.nodeDescriptors[nodeNumber].numberOfChannels
  //
  it('getNumberOfChannels', () => {
    console.log("getNumberOfChannels")
    store.state.nodeDescriptors["1"]["numberOfChannels"] = 2
    //
    let result = getNumberOfChannels(store, 1)
    expect(result).toBe(2)
  });

  //
  // use channel names in MDF, more than previous test
  // store.state.nodeDescriptors[nodeNumber].channelNames
  //
  it('getNumberOfChannels', () => {
    console.log("getNumberOfChannels")
    store.state.nodeDescriptors["1"]["channelNames"] = {
      "1": "Output 1",
      "2": "Output 2",
      "3": "Output 3"
    }
    //
    let result = getNumberOfChannels(store, 1)
    expect(result).toBe(3)
  });

  //
  // use number of channels in MDF, more than previous test
  // store.state.nodeDescriptors[nodeNumber].numberOfChannels
  //
  it('getNumberOfChannels', () => {
    console.log("getNumberOfChannels")
    store.state.nodeDescriptors["1"]["numberOfChannels"] = 4
    //
    let result = getNumberOfChannels(store, 1)
    expect(result).toBe(4)
  });

  //
  // use channel number in layout
  // remove nodeDescriptor so it falls back to layout
  // store.state.layout.nodeDetails[nodeNumber].numberOfChannels
  //
  it('getNumberOfChannels', () => {
    console.log("getNumberOfChannels")
    store.state.nodeDescriptors = {}
    store.state.layout.nodeDetails[1].numberOfChannels = 5
    //
    let result = getNumberOfChannels(store, 1)
    expect(result).toBe(5)
  });
});

