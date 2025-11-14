import { describe, expect, it } from '@jest/globals';

import * as utils from "components/functions/utils.js"

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
      node_channel_name(nodeNumber, channelNumber){
        console.log(`unit_test: node_channel_name ${nodeNumber} ${channelNumber}`)
        let channelName = "undefined"
        if (channelNumber == 1){
          channelName = "switch"
        }
        if (channelNumber == 3){
          channelName = "turnout"
        }
        return channelName
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
      }
    }
  }




describe('utils Test', () => {


  //
  //
  it('TimeStampToText test', () => {
    console.log("TimeStampToText test BEGIN")
    let result = utils.TimeStampToText("202411092105")
    console.log('overloadedLabel: result = ' + result)
    expect(result).toBe("2024/11/09 21:05")
    console.log("TimeStampToText test END")
  });

  //
  //
  it('replaceChannelTokens test', () => {
    console.log("unit_test: replaceChannelTokens test BEGIN")
    let jsonObj = {test1: "${chaNNel1} green",
      test2: "${channel2",
      test3: "${CHANNEL **3**} red",
      test4: "${channel4",
      test5: "text"
    }
    let nodeNumber = 1
    let result = utils.replaceChannelTokens(store, jsonObj, nodeNumber)
    console.log('unit_test: replaceChannelTokens: result = ' + JSON.stringify(result))
    expect(result.test1).toMatch(/switch/);
    expect(result.test3).toMatch(/turnout/);
    console.log("unit_test: replaceChannelTokens test END")
  });


  //
  //
  it('extractMDFTokens test', () => {
    console.log("unit_test: extractMDFTokens test BEGIN")
    let jsonObj = {test1: "${chaNNel1} green",
      test2: "${channel2",
      test3: "${CHANNEL **3**} red",
      test4: "${channel4",
      test5: "${CHANNEL9} red",
      test6: "${CHANNEL2} red",
      test6: "${palette2} red",
      test7: "text"
    }
    let result = utils.extractMDFTokens(store, jsonObj)
    console.log('unit_test: extractMDFTokens: result = ' + JSON.stringify(result, null, " "))
    console.log("unit_test: extractMDFTokens test END")
  });

  //
  //
  it('getListOfTokens test', () => {
    console.log("unit_test: getListOfTokens test BEGIN")
    let jsonObj = {test1: "${chaNNel1} green",
      test2: "${channel2",
      test3: "${CHANNEL **3**} red",
      test4: "${channel4",
      test5: "${CHANNEL9} red",
      test6: "${CHANNEL2} red",
      test6: "${palette2} red",
      test7: "text"
    }
    let result = utils.getListOfTokens(jsonObj)
    console.log('unit_test: getListOfTokens: result = ' + JSON.stringify(result, null, " "))
    console.log("unit_test: getListOfTokens test END")
  });


});

