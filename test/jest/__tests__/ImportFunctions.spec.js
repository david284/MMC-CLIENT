import { describe, expect, it } from '@jest/globals';

import {importFCU} from "components/functions/ImportFunctions.js"

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
    "setters":{
      event_name(eventIdentifier, eventName){
        event_name_updated = true
      },
      node_moduleName(nodeNumber, moduleName){
        node_moduleName_updated = true
      },
      node_name(nodeNumber, nodeName){
        node_name_updated = true
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[],
      "userEvents":[
        {
          "eventId": {"_text": "100"},
          "ownerNode": {"_text": "10"},
          "eventName": {"_text": "event #1"}
        }
      ]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[],
      "userEvents":[
        {
          "eventId": {"_text": "2"},
          "ownerNode": {"_text": "10"},
          "eventName": {"_text": "event #1"}
        }
      ]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[],
      "userEvents":[
        {
          "eventId": {"_text": "1"},
          "ownerNode": {"_text": "10"},
          "eventName": {"_text": "event #1"}
        }
      ]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[],
      "userEvents":[
        {
          "eventId": {"_text": "1"},
          "ownerNode": {"_text": "10"},
          "eventName": {"_text": "event #5"}
        }
      ]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[],
      "userEvents":[
        {
          "eventId": {"_text": "1"},
          "ownerNode": {"_text": "10"},
          "eventName": {"_text": "event #5"}
        }
      ]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[
        {
          "nodeNum": {"_text": "100"},
          "nodeName": {"_text": "CANACC5-100"},
          "moduleName": {"_text": "CANACC5"}
        }
      ],
      "userEvents":[]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[{"nodeNum": {"_text": "20"},"nodeName": {"_text": "CANACC8-20"},"moduleName": {"_text": "CANACC8"}}],
      "userEvents":[]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[{"nodeNum": {"_text": "10"},"nodeName": {"_text": "CANACC5-10"},"moduleName": {"_text": "CANACC5"}}],
      "userEvents":[]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[{"nodeNum": {"_text": "10"},"nodeName": {"_text": "CANACE8C-10"},"moduleName": {"_text": "CANACE8C"}}],
      "userEvents":[]
    }}
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
    const fcuConfig = {"MergModuleDataSet":{
      "userNodes":[{"nodeNum": {"_text": "10"},"nodeName": {"_text": "CANACE8C-10"},"moduleName": {"_text": "CANACE8C"}}],
      "userEvents":[]
    }}
    let modeValue = "overwrite"
    node_name_updated = false
    node_moduleName_updated = false
    importFCU(fcuConfig, store, modeValue)
    expect(node_name_updated).toBe(true)
    expect(node_moduleName_updated).toBe(true)
  });


});

