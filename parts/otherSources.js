/*******************************************************************************
This file contain customFunction made by other people.
Sorted by author/publisher.
With the source at the top of the section.
*******************************************************************************/

////////////////////////////////////////
//source: https://github.com/Max-Makhrov/GoogleSheets/blob/master/2dArray.js

//merge arrays (side-by-side)
/*
  arr1  = [[1, 'a'],
           [2, 'b'],
           [3, 'c']];

  arr2  = [[4, 'd'],
           [5, 'e'],
           [6, 'f']];

  result
          [[1, 'a', 4, 'd'],
           [2, 'b', 5, 'e'],
           [3, 'c', 6, 'f']]
*/
function addColumnsToArray(arr1, arr2) {
  var self = this;
  this.arr2 = arr2;

  function appendColumns(currentValue, index) {
    self.arr2[index].forEach(function(val) { currentValue.push(val); });
  }
  // to prevent affecting original array
  var arr = JSON.parse(JSON.stringify(arr1));
  arr.map(appendColumns);

  return arr;
}

////////////////////////////////////////
//source: https://stackoverflow.com/a/48046426/9588601

/**
 * (Renamed) ogName: symmetric2DArray
 * Takes a 2D array with element arrays with differing lengths
 * and adds empty string elements as necessary to return
 * a 2D array with all element arrays of equal length.
 * @param {array} ar
 * @return {array}
 */
function arCleaner(ar){
  var maxLength;
  var symetric = true;
  if (!Array.isArray(ar)) return [errr, 'not an array'];
  ar.forEach( function(row){
    if (!Array.isArray(row)) return [errr, 'not a 2D array'];
    if (maxLength && maxLength !== row.length) {
      symetric = false;
      maxLength = (maxLength > row.length) ? maxLength : row.length;
    } else { maxLength = row.length }
  });
  if (!symetric) {
    ar.map(function(row){
      while (row.length < maxLength){
        row.push('');
      }
      return row;
    });
  }
  return ar
}
