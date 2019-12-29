import { fetchCurrencies } from "./currency";
import { fetchCountries } from "./country";
import { currencyCountryMapper, manualMapping } from "./util";
import * as fs from "fs";

const filename = process.argv[2] || `data-enhanced.json`;

Promise.resolve()
  .then(() => main())
  .catch(e => {
    console.error(e);
  });

async function main(): Promise<void> {
  console.info(`currency-codes data updater | start`);

  const currencies = await fetchCurrencies();
  const countries = await fetchCountries();
  let matchedCurrencies = currencies.map(currency =>
    currencyCountryMapper(currency, countries)
  );
  matchedCurrencies = matchedCurrencies.map(currency =>
    manualMapping(currency, countries)
  );
  const partiallyUnmatched = matchedCurrencies.filter(
    currency => currency.countries?.length !== currency.isoCountries?.length
  );

  console.log({
    currenciesCount: currencies.length,
    countries: countries.length,
    matchedCurrenciesCount: matchedCurrencies.length,
    partiallyUnmatchedCount: partiallyUnmatched.length
  });

  fs.writeFile(
    filename,
    JSON.stringify({ currencies: matchedCurrencies }),
    e => {
      if (e) {
        throw e;
      }
      console.log(`Results written to file data.json`);
      console.log(`currency-codes data update | end`);
    }
  );
}
