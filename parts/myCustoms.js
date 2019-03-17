/*******************************************************************************
This file contain customFunction I made, feel free to copy them if you like what
you see.
*******************************************************************************/

/**
 * Search by comparing values from an array to a specified object property value
 *        in an array of objects.
 *        then return the values of a different property for the matching objects.
 * @param {string} keyPropStr Name of the property that is used as key for comparison.
 * @param {string} searchedPropStr Name of the property to extract values from objArr.
 * @param {array} keyValArr Values for key Property used for comparison.
 * @param {array} objArr List of object to search in.
 * @param {array} excepArr List of value to avoid searching.
 * Example:
 *         var keyVals = [1, 2, 3 ];
 *         var objArr = [ {a: 1, b: 2, c: "boo", d: "Hello " },
 *                        {a: 2, b: 3, c: 1, d: "???"},
 *                        {a: 3, b: "...", c: 2, d: "world !" }];
 *         var excepArr = [2];
 *         srchByCmpr("a", "d", keyVals, objArr, excepArr);
 *
 *         // → [["Hello", "From: 1"],
 *               ["Execption", "From: 2"]
 *               ["world !", "From: 3"]];
 * @return {array} Values requested from the list of objects .
 * @customFunction
 */
function srchByCmpr(keyPropStr, searchedPropStr, keyValArr, objArr, excepArr) {
  
  function chkAbsence(value2check, array) { //Avoid dependencies.
    
    if(array == undefined) return true ;
    
    function checkInequal(a) { return a != value2check };
    res = array.every(checkInequal);
    return res;
  };
  
  var searchedValues = [];
  keyValArr = typeof(keyValArr) == "string" ? [keyValArr] : keyValArr;
  if (!Array.isArray(keyValArr)) { return [errr, 'keyValues array not an array'] };
  if (!Array.isArray(objArr)) { return [errr, 'objArr not an array, must be an array of objects'] };
  keyValArr = keyValArr.join().split(","); //get1DArray
  
  for (var a = 0; a < keyValArr.length; a++) {
    if (searchedValues.length !== a) { searchedValues.push(["Missing", "From: "+keyValArr[a-1]]) };
    
    if (chkAbsence(keyValArr[a].toLowerCase(), excepArr)) {
      
      for (var b = 0; b < objArr.length; b++) {
        
        if (searchedPropStr === "wholeObject") {
          
          if (keyValArr[a].toLowerCase() == objArr[b][keyPropStr].toLowerCase()) {
            searchedValues.push([objArr[b], "From: "+keyValArr[a]]);
            break;
          };
          
        } else {
          
          if (objArr[b][keyPropStr].toLowerCase() == keyValArr[a].toLowerCase()) {
            searchedValues.push([objArr[b][searchedPropStr], "From: "+keyValArr[a]]);
            break;
          };
        };
        
      } 
    } else {
      searchedValues.push(["Exception", "In exception list for: "+keyValArr[a]]);
    };
  }
  
  while (searchedValues.length < keyValArr.length) { searchedValues.push(["Missing", "On end check"]) };
  //Return
  return searchedValues;
}


/**
 * Function to make sure rounding does not crash with toFixed().
 * Will only apply toFixed when possible else will return entry raw.
 */
function myToFixed(number, decimal) {
  if (number && (typeof(number) == "number" || typeof(number) == "string")) {
    return Number(number).toFixed(decimal);
  } else {
    return number;
  };
};

/**
 * Original function: https://stackoverflow.com/a/48046426/9588601
 * Calculate Array Width
 * @customFunction
 */
var chkArrSz = function(ar){
  var maxLength;
  if (!Array.isArray(ar)) return ['error', 'not an array'];
  ar.forEach( function(row){
    if (!Array.isArray(row)) return ['error', 'not a 2D array'];
    if (maxLength && maxLength !== row.length) {
      symetric = false;
      maxLength = (maxLength > row.length) ? maxLength : row.length;
    } else { maxLength = row.length }
  });
  //  Logger.log("chkArrSz:\n Len-rows: "+ array.length + "\n W-cells: "+ arTotalWid);
  return [ar.length , maxLength];
};

/**
 * Check range size.
 * @customFunction
 */
var chkRngSz = function(range) {
  //  Logger.log("chkRngSz:\n H-rows: "+ range.getNumRows() + "\n W-cols: "+ range.getNumColumns());
  return [range.getNumRows(),range.getNumColumns()];
};

/**
 * Check if array and range sizes match.
 * @customFunction
 */
var chkAr2RgMatch = function(array, range) {
  var arSiz = chkArrSz(array),
      rngSiz = chkRngSz(range);
  //  Logger.log("chkAr2RgMatch:\n H-rows: "+ (arSiz[0] == rngSiz[0]) + "\n W-cols: "+ (arSiz[1] == rngSiz[1]));
  return ((arSiz[0] == rngSiz[0]) && (arSiz[1] == rngSiz[1]));
};

/**
 * If checked elem DOES NOT match with any of the values
 * in the array return true.
 * @customFunction
 */
var chkAbsence = function(value2check, array) {
  if(array == undefined) return true ;
  
  function checkInequal(a) { return a != value2check };
  
  res = array.every(checkInequal);
  //  Logger.log("checkIfNoMatch:\n result: "+res);
  return res;
};
