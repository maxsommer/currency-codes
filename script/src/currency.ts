import { Country } from "./country";
import {
  fetchWikipediaTableById,
  WIKIPEDIA_PAGE,
  removeEmojiFromString
} from "./util";

export interface Currency {
  code?: string;
  number?: string;
  digits?: number;
  currency?: string;
  countries?: string[];
  isoCountries?: Country[];
}

interface CurrencyTableRow {
  Code: string;
  Num: string;
  E: string;
  Currency: string;
  "Locations using this currency": string;
}

/**
 * Returns an array of Currency objects fetched from Wikipedia currency page
 * @returns {Promise<Currency[]>}
 */
export async function fetchCurrencies(): Promise<Currency[]> {
  const currencyData = await fetchWikipediaTableById(
    WIKIPEDIA_PAGE.CURRENCY_LIST
  );
  return currencyData.map(mapCurrencyTable);
}

/**
 * Maps wikipedia table row to internally used currency data model
 * @param {CurrencyTableRow} row Row of wikipedia currency table
 * @returns {Currency}
 */
function mapCurrencyTable(row: CurrencyTableRow): Currency {
  const country: Currency = {};
  country.code = row.Code.trim();
  country.number = row.Num.trim();
  country.digits = Number(row.E.replace("*", ""));
  country.currency = row.Currency.trim();
  const countryString = removeEmojiFromString(
    row["Locations using this currency"]
  );
  let countries = countryString.split(",");
  countries = countries.filter(s => s.length > 0);
  // Some countries had "\'" somehow inside their names, these need to removed
  countries = countries.map(c => c.replace(new RegExp(`\'`, "g"), "").trim());
  country.countries = countries;
  return country;
}
