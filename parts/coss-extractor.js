/*
  @customFunction
*/
//////////////////////////////////////////////////////////////////////////
//Coss data extractor:
/**
 * ARRAYFORMULA wasnt working, made my own.
 * little variant: Gather pair symbols
 *    organised as rows and columns
 * Coss.marketPrice() example:
 *      {"symbol":"OMG_XRP","price":"3.7093","updated_time":1546570108810}
 * @customFunction
 */
function AFmarketPrices(tickers, baseCurrency, except) {

  tickers = tickers.join().split(","); //get1DArray
  baseCurrency = baseCurrency.toUpperCase();
  
  var ar = [];
  for (var i = 0; i < tickers.length; i++) {
    //if coin isnt a fiat or stable coin
    if (chkAbsence(tickers[i], except)) {
      
      //if coin is the Base currency
      if (tickers[i] == baseCurrency) {
        var price = 1,
            symbol = tickers[i];
        
        //If not base
        } else {
          
          var coin = Coss.marketPrice(tickers[i]+"_"+baseCurrency),
              price = coin[0].price,
              symbol = coin[0].symbol;
        };
      
      //If coin is a stable coin
    } else {
      var coin = Coss.marketPrice(baseCurrency+"_"+tickers[i]),
          price = 1 / coin[0].price,
          symbol = baseCurrency+"_"+tickers[i];
    };
    //Push base and fiat value to coss rec
    ar.push([symbol, price])
  }
//  Logger.log(ar)
  return ar;
}
