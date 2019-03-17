/**
 * Coin gecko extraction function. Get data from
 *         https://api.coingecko.com/api/v3/coins/COIN_ID API
 * Set variables unav = Unavailable and errr = undefined_error, or anything you want.
 * The key param work for metric contained in objects, not arrays.
 * Dependencies: myToFixed (parts/myCustoms)
 * examples:
 *         cgkoExtV1("ethereum", bCurrency, bFiat);
 *         // → [1D Array];
 *         cgkoExtV1("komodo", bCurrency, bFiat, "community_data.facebook_likes");
 *         // → 16645;
 * @param {String} asset The Cryptocurrency to search for.
 * @param {String} bCurrency The base currency you desire. e.g. "btc"
 * @param {String} bFiat The fiat currency you desire. e.g. "usd"
 * @param {String} key The path to the metric you're searching. e.g. "community_data.facebook_likes"
 *
 * @return {Array | String} response object
 * @customFunction
 */
function cgkoExtV1( asset, bCurrency, bFiat, key){

  if(!bCurrency) bCurrency = "btc";
  if(!bFiat) bFiat = "usd";

  //asset undefined handling
  if (asset == undefined || typeof(asset) != "string") {
    Logger.log(errr + "\n Asset:   " + asset + "\n Object type:   " + typeof(asset));
    return errr;
  };

  //Working coinGecko call and data
  var cgkoAstApi = UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/"+ asset + "?tickers=false&developer_data=false",
                                     {'muteHttpExceptions': true});
  try { //eg: https://api.coingecko.com/api/v3/coins/bitcoin?localization=false

    var ast = JSON.parse(cgkoAstApi.getContentText());
    if (ast == undefined ) {
      Logger.log(unav + "\n Asset:   " + asset);
      return unav;
    };
    var astMkt = ast['market_data'];

    if ( key == undefined) {
      //Handle if ICO metrics are available or not and base calculation
      var ico = {};
      if (ast['ico_data']) {
        var astIco = ast['ico_data'];
        if ( astIco.quote_public_sale_amount && astIco.base_public_sale_amount ) {
          //ternary trip ... Handle Ico end date to avoid errors
          var endDate = (astIco.ico_end_date == null || undefined) ? "Date missing" : astIco.ico_end_date;
          endDate = endDate != "Date missing" ? (endDate.indexOf("T") > -1 ? endDate.slice(0,endDate.indexOf("T")) : endDate):endDate;

          ico.end_date = endDate;
          ico.price = (Number(astIco.quote_public_sale_amount) / Number(astIco.base_public_sale_amount));
          ico.currency = astIco.quote_public_sale_currency.toLowerCase() || unav;
          ico.priceChange = ((astMkt.current_price[ico.currency] / ico.price -1)*100);
          ico.priceChange = myToFixed(ico.priceChange, 2);

        } else {
          ico.price = "Not enought ico data";
          ico.currency = "---";
          ico.end_date = "---";
          ico.priceChange = "---";
        };
      } else {
        ico.price = "Not enought ico data";
        ico.currency = "---";
        ico.end_date = "---";
        ico.priceChange = "---";
      };

      var extraCurr = bCurrency.toLowerCase() == "eth" ? "btc" : "eth";

      //Resorted in a simplified array combining both base and convertion metrics
      /*| 0.Ticker |1.mc_rank | 2.Fiat_value | 3.base_curr_value | 4.ETH_value | 5.Volume |
       6.Market_cap | 7.Circulating_sup. | 8.ICO public sale price | 9. Ico accepted currency |
       10. Ico price change | 11. Ico end (YYYY-MM-DD) | 12.All-time-high fiat | 13.fiat ATH % change |
       14. All-time-high base_curr	| 15.base_curr ATH % change | 16.%change 1D | 17.%change 1W |
       18.%change 1M | 19.Name | 20.links homepage | 21.Last updated |*/
      var cgkoArr = [
        ast.symbol,
        ast.market_cap_rank,
        astMkt.current_price[bFiat],
        astMkt.current_price[bCurrency],
        astMkt.current_price[extraCurr],
        astMkt.total_volume[bFiat],
        astMkt.market_cap[bFiat],
        astMkt.circulating_supply,
        ico.price,
        ico.currency,
        ico.priceChange,
        ico.end_date,
        astMkt.ath[bFiat],
        myToFixed(astMkt.ath_change_percentage[bFiat], 2),
        astMkt.ath[bCurrency],
        myToFixed(astMkt.ath_change_percentage[bCurrency], 2),
        myToFixed(astMkt.price_change_percentage_24h_in_currency[bFiat], 2),
        myToFixed(astMkt.price_change_percentage_7d_in_currency[bFiat], 2),
        myToFixed(astMkt.price_change_percentage_30d_in_currency[bFiat], 2),
        ast.id,
        ast.links.homepage[0],
        ast.last_updated
      ];

      return cgkoArr;
    } else {
      var ks = ast;
      var keyPath = key.split(".");
      //        Logger.log(keyPath);
      for (var i = 0; i < keyPath.length; i++) {
        var ks = ks[keyPath[i]];
        //        Logger.log("cntr: "+ i+ "\n keyPath[i]: "+ keyPath[i]+ "\n ast: "+ ast +"\n"+ "Type of: "+ "\n keyPath[i]: "+ typeof(keyPath[i])+ "\n ast: "+ typeof(ast));
      }
      return ks;
    };
  } catch (e) {
    Logger.log("Catching: "+e);
    Logger.log(cgkoAstApi.getResponseCode());
    Logger.log(cgkoAstApi.getHeaders());
    return [errr, "request failed", cgkoAstApi.getResponseCode()];
  };
}

//quick and assume the api alway working
function cgkoList() {
  try {
    var cgkoApi = UrlFetchApp.fetch("https://api.coingecko.com/api/v3/coins/list",
                                    {'muteHttpExceptions': true});
    var dt = JSON.parse(cgkoApi.getContentText());
    return dt;
  } catch(e) {
    Logger.log(e);
    return errr;
  };
}
