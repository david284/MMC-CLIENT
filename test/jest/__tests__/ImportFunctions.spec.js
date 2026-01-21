import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';


import {importFCU} from "components/functions/ImportFunctions.js"
import * as ImportFunctions from "components/functions/ImportFunctions.js"

import * as mock_store from "../../../test/jest/mock_store.js";


describe('ImportFunctions Test', () => {

  var event_name_updated = false
  var node_name_updated = false
  var node_moduleName_updated = false

  let store = {
    "state":{"layout":{
      "eventDetails":{
        "000A0001": {"name": "event #1"},
        "000A0002": {}
      },
      "nodeDetails":{
        "10": {"name": "CANACC5-10", "moduleName": "CANACC5"},
        "20": {}
      }
    }},
    "getters":{
      node_token_name(nodeNumber, tokenName, tokenNumber){
        console.log(`unit_test: node_channel_name ${nodeNumber} ${tokenName} ${tokenNumber}`)
        let replacementName = "undefined"
        if (tokenNumber == 1){
          replacementName = "switch"
        }
        if (tokenNumber == 3){
          replacementName = "turnout"
        }
        return replacementName
      }
    },
    "setters":{
      event_name(eventIdentifier, eventName){
        event_name_updated = true
        console.log(`unit_test: event_name updated ${event_name_updated}`)
      },
      node_moduleName(nodeNumber, moduleName){
        node_moduleName_updated = true
      },
      node_name(nodeNumber, nodeName){
        node_name_updated = true
      },
      node_token_name(nodeNumber, token, channelNumber, name){
        console.log(`unit_test: setter: node_token_name: ${nodeNumber} ${token} ${channelNumber} ${name}`)
        if (store.state.layout.nodeDetails[nodeNumber].tokens == undefined) {store.state.layout.nodeDetails[nodeNumber].tokens = {}}
        if (store.state.layout.nodeDetails[nodeNumber].tokens[token] == undefined) {store.state.layout.nodeDetails[nodeNumber].tokens[token] = {}}
        store.state.layout.nodeDetails[nodeNumber].tokens[token][channelNumber]={"name":name}
      }
    }
  }

  //---------------------------------------------------------------------------
  //  FCU Import
  //---------------------------------------------------------------------------

  //
  // event number 100 doesn't exist
  // expect update
  //
  it('fcuImport event#1', () => {
    console.log("fcuImport event#1")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userEvents>"
        + "<eventValue>100</eventValue>"
        + "<eventNode>10</eventNode>"
        + "<eventName>event #1</eventName>"
      + "</userEvents>"
      + "<userEvents>"
        + "<eventValue>101</eventValue>"
        + "<eventNode>10</eventNode>"
        + "<eventName>event #1</eventName>"
      + "</userEvents>"
    + "</MergModuleDataSet>"

    let modeValue = "retain"
    event_name_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(event_name_updated).toBe(true)
  });


  //
  // event number 2 doesn't have a name
  // expect update
  //
  it('fcuImport event#2', () => {
    console.log("fcuImport event#2")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userEvents>"
        + "<eventValue>2</eventValue>"
        + "<eventNode>10</eventNode>"
        + "<eventName>event #1</eventName>"
      + "</userEvents>"
    + "</MergModuleDataSet>"

    let modeValue = "retain"
    event_name_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(event_name_updated).toBe(true)
  });

  //
  // event name matches
  // don't expect update
  //
  it('fcuImport event#3', () => {
    console.log("fcuImport event#3")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userEvents>"
        + "<eventValue>1</eventValue>"
        + "<eventNode>10</eventNode>"
        + "<eventName>event #1</eventName>"
      + "</userEvents>"
    + "</MergModuleDataSet>"

    let modeValue = "retain"
    event_name_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(event_name_updated).toBe(false)
  });


  //
  // event name doesn't match
  // mode is retain, don't expect update
  //
  it('fcuImport event#4', () => {
    console.log("fcuImport event#4")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
    + "<MergModuleDataSet>"
    + "<userEvents>"
      + "<eventValue>1</eventValue>"
      + "<eventNode>10</eventNode>"
      + "<eventName>event #5</eventName>"
    + "</userEvents>"
  + "</MergModuleDataSet>"

    let modeValue = "retain"
    event_name_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(event_name_updated).toBe(false)
  });


  //
  // event name doesn't match
  // mode is overwrite, expect update
  //
  it('fcuImport event#5', () => {
    console.log("fcuImport event#5")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
    + "<MergModuleDataSet>"
      + "<userEvents>"
        + "<eventValue>1</eventValue>"
        + "<eventNode>10</eventNode>"
        + "<eventName>event #5</eventName>"
      + "</userEvents>"
    + "</MergModuleDataSet>"

    let modeValue = "overwrite"
    event_name_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(event_name_updated).toBe(true)
  });


  //
  // Node number 100 doesn't exist
  // expect update
  //
  it('fcuImport node#1', () => {
    console.log("fcuImport node#1")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userNodes>"
        + "<nodeNum>100</nodeNum>"
        + "<nodeName>CANACC5-100</nodeName>"
        + "<moduleName>CANACC5</moduleName>"
      + "</userNodes>"
      + "<userNodes>"
        + "<nodeNum>101</nodeNum>"
        + "<nodeName>CANACC5-101</nodeName>"
        + "<moduleName>CANACC5</moduleName>"
      + "</userNodes>"
    + "</MergModuleDataSet>"

    let modeValue = "retain"
    node_name_updated = false
    node_moduleName_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(node_name_updated).toBe(true)
    expect(node_moduleName_updated).toBe(true)
  });

  //
  // Node name doesn't exist for node 20
  // expect update
  //
  it('fcuImport node#2', () => {
    console.log("fcuImport node#2")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userNodes>"
        + "<nodeNum>20</nodeNum>"
        + "<nodeName>CANACC8-20</nodeName>"
        + "<moduleName>CANACC8</moduleName>"
      + "</userNodes>"
    + "</MergModuleDataSet>"

    let modeValue = "retain"
    node_name_updated = false
    node_moduleName_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(node_name_updated).toBe(true)
    expect(node_moduleName_updated).toBe(true)
  });

  //
  // Node name matches for node 10
  // don't expect update
  //
  it('fcuImport node#3', () => {
    console.log("fcuImport node#3")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userNodes>"
        + "<nodeNum>10</nodeNum>"
        + "<nodeName>CANACC5-10</nodeName>"
        + "<moduleName>CANACC5</moduleName>"
      + "</userNodes>"
    + "</MergModuleDataSet>"

    let modeValue = "overwrite"
    node_name_updated = false
    node_moduleName_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(node_name_updated).toBe(false)
    expect(node_moduleName_updated).toBe(false)
  });

  //
  // Node name doesn't match for node 10
  // mode is retain - don't expect update
  //
  it('fcuImport node#4', () => {
    console.log("fcuImport node#4")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userNodes>"
        + "<nodeNum>10</nodeNum>"
        + "<nodeName>CANACE8C-10</nodeName>"
        + "<moduleName>CANACE8C</moduleName>"
      + "</userNodes>"
    + "</MergModuleDataSet>"

    let modeValue = "retain"
    node_name_updated = false
    node_moduleName_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(node_name_updated).toBe(false)
    expect(node_moduleName_updated).toBe(false)
  });

  //
  // Node name doesn't match for node 10
  // mode is overwrite - expect update
  //
  it('fcuImport node#5', () => {
    console.log("fcuImport node#5")

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userNodes>"
        + "<nodeNum>10</nodeNum>"
        + "<nodeName>CANACE8C-10</nodeName>"
        + "<moduleName>CANACE8C</moduleName>"
      + "</userNodes>"
    + "</MergModuleDataSet>"

    let modeValue = "overwrite"
    node_name_updated = false
    node_moduleName_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(node_name_updated).toBe(true)
    expect(node_moduleName_updated).toBe(true)
  });

  //
  // test support for older channel name inport into new tokens structure
  each([
    ["unit_test_1", "overwrite", "unit_test_1"],
    ["unit_test_2", "retain", "unit_test_1"],
    ["unit_test_3", "overwrite", "unit_test_3"]
  ]).test('addNodeChannelName test - %s %s', (test_name, modeValue, expected) => {
    console.log("addNodeChannelName test BEGIN")
    ImportFunctions.addNodeChannelName(mock_store, 10, 1, test_name, modeValue)
    //console.log(`unit_test: addNodeChannelName: ${JSON.stringify(mock_store, null, "  ")}`)
    expect(mock_store.state.layout.nodeDetails[10].tokens.channel[1].name).toBe(expected)
    console.log("addNodeChannelName test END")
  });


});

