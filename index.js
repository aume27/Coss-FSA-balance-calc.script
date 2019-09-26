/**
 * Title: FSA_balance_Analyzer_Script (fSABAS)
 * @customFunction
 *
 * Made using:
 *  Clasp (google version control software)
 *  Atom editor
 *
 * Creadits:
 * Developers that provided the functions in otherSources(.gs | .js)
 *
 * Notes:
 *  The "parts/" in file names is a folder name. (for download to computer using Clasp)
 *  in rgMap:
 *  Ranges using sht.getRange().getValue HOLDs the A1Notation of the range
 */
  //Spreadsheet mapping
var proj01 = SpreadsheetApp.getActiveSpreadsheet(),
    sht01 = proj01.getSheetByName("Db"),
    sht02 = proj01.getSheetByName("Dashboard"),
    sht03 = proj01.getSheetByName("Settings");

  //Ss ranges map:
var rgMap = {
    //Dashboard
  baseCC: "fix_baseCurr_cell",
  fiatCC: "fix_fiatConverter_cell",
  tracked: sht03.getRange("sufix_tracked").getValue().toString(),
    //Settings
  cossFiats: sht03.getRange("sufix_coss_fiats").getValue().toString(),
};

  //Error handlers
var errr = "undefined_error: - ",
    unav = "Unavailable",
    noIco = "Not enought ico data";

  //Active data base.
var db = {
  baseCurr:   sht02.getRange(rgMap.baseCC).getValue(),
  fiatConv:  sht02.getRange(rgMap.fiatCC).getValue(),
  tracked:   sht02.getRange(rgMap.tracked).getValues(),
  fiatsStables: sht03.getRange(rgMap.cossFiats).getValues(),
  coss: {
    //data_records
    rec: []
  },
  cGko: {
    ids: [],
    rec: []
  }
};

/******************************************************************************/
//Script
function cossFSA_balCalcV2() {
  var dtLen = db.tracked.length;


  //1. Build ids lists for coingecko.
    //Get coingecko.com coin ids based on tracked and check if coingecko is properly responding.
  var geckoList = cgkoList()

  db.cGko.ids = srchByCmpr("symbol", "id", db.tracked, geckoList, db.fiatsStables);
  if (db.cGko.ids[0] == errr || geckoList == errr ) {
    Logger.log("\nError finding coin gecko Id list. Might be the service provider is not responding or\n the tracked_coins column as changed inappropriately.\n (line 64, file: index.js)");
    Logger.log(geckoList);
    Logger.log(db);
    Browser.msgBox("Retreiving Ids for coingecko.com",
                   "Error finding coin gecko Id list. Might be the service provider is not responding \n the tracked_coins column as changed inappropriately.\n  Send a email to the Spreadsheet creator.\n(line 64, file: index.js)",
                   Browser.Buttons.OK);
    return errr;
  };

    //Handle execption and errors
  // [SYMBOL, id]... unav result in skip request
  var exCoin = [["CVC", "civic"],["CELT", unav] ,["COSS", unav], ["LALA", unav], ["COS", "coss"]
               ];

  for (var i= 0; i < db.cGko.ids.length; i++) {
    for (var a = 0 ; a < exCoin.length; a++) {
      if( db.cGko.ids[i][1] == "From: "+ exCoin[a][0]) db.cGko.ids[i][0] = exCoin[a][1];
    };
  };

  //2. Extract data from sources
    // Base currency data
  var baseGeckoId = srchByCmpr("symbol", "id", db.baseCurr, geckoList, db.fiatsStables);
  db.baseCurr_stats = [cgkoExtV1(baseGeckoId[0][0], db.baseCurr, db.fiatConv)];

    //Coss data
  db.coss.rec = AFmarketPrices(db.tracked, db.baseCurr, db.fiatsStables);

    //Get coingecko.com data
  for (var c = 0; c < dtLen; c++ ) {
    var r1;
    if (db.cGko.ids[c][0] !== "Missing" && db.cGko.ids[c][0] !== "Exception") {
      r1 = cgkoExtV1(db.cGko.ids[c][0], db.baseCurr, db.fiatConv);

      if (r1 == errr || r1 == unav) {
        r1 = [unav, "Id not found. Cause: "+ r1+"  . For: "+ db.tracked[c][0]]};

    } else {
      r1 = [unav,"Id not found. Cause: "+ db.cGko.ids[c][0]+"  . For: "+ db.tracked[c][0]];
    };

    db.cGko.rec.push(r1);
  };

  //3. Clean and concatenate filtered/sorted data into final result array
  var ar1 = arCleaner(db.coss.rec);
  var ar2 = arCleaner(db.cGko.rec);

    //verify that arrays have been cleaned, if error occured they get over writen.
  if(ar1[0] == errr || ar2[0] == errr) {
    Logger.log("\nError preparing arrays to be sent to Spreadsheet.\n(line 99, file: index.js)");
    Logger.log(ar1);
    Logger.log(ar2);
    Browser.msgBox("Cleaning array error", "Error preparing arrays to be sent to Spreadsheet.\n  Send a email to the Spreadsheet creator. \n(line 99, file: index.js)",
                   Browser.Buttons.OK);
    return errr;
  };
  var finAr = addColumnsToArray(ar1, ar2);

    //Check the size: if (data_records rows < data length) insertRow.
  var dataRec = sht03.getRange("sufix_dt_rec").getValue().toString();

  var missingRows = (dtLen - sht01.getRange(dataRec).getNumRows());
  if(missingRows > 0) {
    for (var i = 0; i < missingRows; i++) {
      sht01.insertRowAfter(sht01.getRange("A1:A").getLastRow());
    }
  };

  //4. Refresh range position, verify data sizes and send data to spreadsheet.
  var baseCRec = sht03.getRange("sufix_base_curr_rec").getValue().toString();
  dataRec = sht03.getRange("sufix_dt_rec").getValue().toString(); //refresh range size

  var veriB = chkAr2RgMatch(db.baseCurr_stats, sht01.getRange(baseCRec));
  var veri = chkAr2RgMatch(finAr, sht01.getRange(dataRec));


  if (veriB && veri) {
    sht01.getRange(baseCRec).setValues(db.baseCurr_stats);
    sht01.getRange(dataRec).setValues(finAr);

   Logger.log(db);
   return "done";

  } else if (!veriB) {// Base currency error
    Logger.log("Error on last operation, push data to Ss \n Mostly due to data size doesnt fit range. \n  Send a email to the Spreadsheet creator. \n(line: 76, file: index.js)");
    Logger.log(chkArrSz(db.baseCurr_stats));
    Logger.log(chkRngSz(sht01.getRange(baseCRec)));
    Logger.log(chkAr2RgMatch(db.baseCurr_stats, sht01.getRange(baseCRec)));
    Logger.log(db);
    Browser.msgBox("Base currency to Spreadsheet",
                   "Error on last operation, push base currency data to Ss \n Mostly due to data size doesnt fit range.\n  Send a email to the Spreadsheet creator.\n(line: 76, file: index.js)",
                   Browser.Buttons.OK);
    return errr;

  } else if (!veri) { //data record error
    Logger.log("Error on last operation, push data to Ss \n Mostly due to data size doesnt fit range.\n  Send a email to the Spreadsheet creator. \n(line: 80, file: index.js)");
    Logger.log(chkArrSz(finAr));
    Logger.log(chkRngSz(sht01.getRange(dataRec)));
    Logger.log(chkAr2RgMatch(finAr, sht01.getRange(dataRec)));
    Logger.log(db);
    Browser.msgBox("Data records to Spreadsheet",
                   "Error on last operation, push data to Ss \n Mostly due to data size doesnt fit range.\n Send a email to the Spreadsheet creator. \n(line: 80, file: index.js)",
                   Browser.Buttons.OK);
    return errr;
  };

}
