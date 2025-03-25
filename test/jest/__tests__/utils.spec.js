import { describe, expect, it } from '@jest/globals';

import * as utils from "components/functions/utils.js"

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



});

