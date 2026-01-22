import { describe, expect, it } from '@jest/globals';
import each from 'jest-each';

import * as ImportFunctions from "components/functions/ImportFunctions.js"
import * as mock_store from "../../../test/jest/mock_store.js";

describe('ImportFunctions Test', () => {

  //---------------------------------------------------------------------------
  //  FCU Import
  //---------------------------------------------------------------------------


  //
  // fcu import event name tests
  // At start, event doesn't exist
  //
  each([
    ["unit_test_1", "overwrite", true],     // new event - added
    ["unit_test_1", "overwrite", false],    // same event name - not added
    ["unit_test_2", "retain", false],       // new event name - retain - not added
    ["unit_test_3", "overwrite", true]      // new event name - overwrite - added
  ]).test('fcuImport_event test - %s %s %s', (test_name, modeValue, expected) => {
    console.log(`fcuImport_event BEGIN ${test_name}, ${modeValue}, ${expected}`)

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userEvents>"
        + "<eventValue>100</eventValue>"
        + "<eventNode>10</eventNode>"
        + "<eventName>" + test_name + "</eventName>"
      + "</userEvents>"
    + "</MergModuleDataSet>"

    mock_store.state.event_name_updated = false
    ImportFunctions.importFCU(fcuConfig, mock_store, modeValue)
    console.log(`unit_test: fcuImport_event: ${JSON.stringify(mock_store, null, "  ")}`)
    expect(mock_store.state.event_name_updated).toBe(expected)
    console.log("fcuImport_event END")
  });

  //
  // Node name tests
  // Node number 100 doesn't exist
  //
  each([
    ["CANACC5-100","overwrite", true],    // new node - so updated
    ["CANACC5-100","overwrite", false],   // same name, no update
    ["CANACC5-1000","retain", false],     // new name, but retain - no update
    ["CANACC5-1000","overwrite", true]    // new name, overwrite - update true
  ]).test('fcuImport_node %s %s', (nodeName, modeValue, expected) => {
    console.log(`fcuImport_node ${nodeName}, ${modeValue}`)

    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userNodes>"
        + "<nodeNum>100</nodeNum>"
        + "<nodeName>" + nodeName +"</nodeName>"
        + "<moduleName>CANACC5</moduleName>"
      + "</userNodes>"
      + "</MergModuleDataSet>"
    mock_store.state.node_name_updated = false
    ImportFunctions.importFCU(fcuConfig, mock_store, modeValue)
    console.log(`unit_test: fcuImport_node: ${JSON.stringify(mock_store, null, "  ")}`)
    expect(mock_store.state.node_name_updated).toBe(expected)
  });

  //
  // module name tests
  // Node number 200 doesn't exist
  //
  each([
    ["CANMNT","overwrite", true],       // new node - so updated
    ["CANMNT","overwrite", false],      // same name, no update
    ["CANMNT5000","retain", false],     // new name, but retain - no update
    ["CANMNT5000","overwrite", true]    // new name, overwrite - update true
  ]).test('fcuImport_moduleName %s %s', (moduleName, modeValue, expected) => {
    console.log(`fcuImport_moduleName ${moduleName}, ${modeValue}`)
    const fcuConfig = `<?xml version="1.0" standalone="yes"?>`
      + "<MergModuleDataSet>"
      + "<userNodes>"
        + "<nodeNum>200</nodeNum>"
        + "<nodeName>CANACC5</nodeName>"
        + "<moduleName>" + moduleName + "</moduleName>"
      + "</userNodes>"
      + "</MergModuleDataSet>"
    mock_store.state.node_moduleName_updated = false
    ImportFunctions.importFCU(fcuConfig, mock_store, modeValue)
    console.log(`unit_test: fcuImport_moduleName: ${JSON.stringify(mock_store, null, "  ")}`)
    expect(mock_store.state.node_moduleName_updated).toBe(expected)
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
    console.log(`unit_test: addNodeChannelName: ${JSON.stringify(mock_store, null, "  ")}`)
    expect(mock_store.state.layout.nodeDetails[10].tokens.channel.userNames[1]).toBe(expected)
    console.log("addNodeChannelName test END")
  });

  //
  // test support for token name inport into tokens structure
  each([
    ["unit_test_1", "overwrite", "unit_test_1"],
    ["unit_test_2", "retain", "unit_test_1"],
    ["unit_test_3", "overwrite", "unit_test_3"]
  ]).test('addNodeUserName test - %s %s', (test_name, modeValue, expected) => {
    console.log("addNodeUserName test BEGIN")
    ImportFunctions.addNodeUserName(mock_store, 20, "unitTestToken", 1, test_name, modeValue)
    console.log(`unit_test: addNodeUserName: ${JSON.stringify(mock_store, null, "  ")}`)
    expect(mock_store.state.layout.nodeDetails[20].tokens.unitTestToken.userNames[1]).toBe(expected)
    console.log("addNodeUserName test END")
  });


});

