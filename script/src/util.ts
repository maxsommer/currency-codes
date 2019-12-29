import { Currency } from "./currency";
import { Country } from "./country";

const wtf = require("wtf_wikipedia");

export enum WIKIPEDIA_PAGE {
  COUNTRY_LIST = 58502940,
  CURRENCY_LIST = 15403
}

/**
 * Returns Currency object enhanced with isoCountries field, an array of Country
 * objects mapped from the ISO country list
 * @param {Currency} currency
 * @param {Country[]} countries
 * @returns {Currency}
 */
export function currencyCountryMapper(
  currency: Currency,
  countries: Country[]
): Currency {
  const isoCountries: Country[] = [];
  if (currency.countries === undefined) {
    return {};
  }
  for (const currencyCountry of currency.countries) {
    let countryName = currencyCountry.trim().toLowerCase();
    countryName = removeAccentsFromString(countryName);
    let fuzzyCountryName = countryName.replace(/\(.*\)/g, "").trim();
    fuzzyCountryName = removeAccentsFromString(fuzzyCountryName);
    const potentialIsoCountries = countries.filter(country =>
      countryFilter(country, countryName, fuzzyCountryName, currency.number)
    );
    let probableCountry: Country | undefined = potentialIsoCountries[0];
    if (potentialIsoCountries.length > 1) {
      probableCountry = countries.find(country =>
        countryFilter(
          country,
          countryName,
          fuzzyCountryName,
          currency.number,
          "name"
        )
      );
      if (probableCountry === undefined) {
        probableCountry = countries.find(country =>
          countryFilter(
            country,
            countryName,
            fuzzyCountryName,
            currency.number,
            "numeric"
          )
        );
      }
    }

    const isoCountry = probableCountry;
    if (isoCountry) {
      isoCountries.push(isoCountry);
    }
  }
  return { ...currency, isoCountries };
}

/**
 * Some of the country codes can't be idenfitied via our fuzzy logic. Therefore
 * we may be better off actually mapping some of them manually instead.
 * @param {Currency} currency
 * @param {Country[]} countries
 * @returns {Currency}
 */
export function manualMapping(
  currency: Currency,
  countries: Country[]
): Currency {
  let country: Country | undefined;

  if (currency.number === "976") {
    // Congolese franc, Congo
    country = countries.find(country => country.numeric === "180");
  }
  if (currency.number === "997") {
    // USN (US dollar, next day), USA
    country = countries.find(country => country.numeric === "840");
  }
  if (currency.number === "950") {
    // CFRA franc BEAC, Congo
    country = countries.find(country => country.numeric === "180");
  }
  if (currency.number === "960") {
    // XDR (Special drawing rights), No countries instead of "International Monetary Fund"
    country = undefined;
    currency.countries = [];
  }
  if (currency.number === "952") {
    // XOF (CFA franc BCEAO), côte d'Ivoire
    country = countries.find(country => country.numeric === "384");
  }
  if (currency.number === "953") {
    // XPF (CFO franc [franc Pacifique]), French Polynesia
    country = countries.find(country => country.numeric === "258");
  }
  if (currency.number === "994") {
    // XSU (SUCRE), No countries instead of "Unified System for Regional Compensation (SUCRE)"
    country = undefined;
    currency.countries = [];
  }
  if (currency.number === "965") {
    // XUA (ADB Unit of Account), No countries instead of "African Development Bank"
    country = undefined;
    currency.countries = [];
  }

  if (currency.isoCountries !== undefined && country !== undefined) {
    currency.isoCountries = [...currency.isoCountries, country];
  }
  return currency;
}

/**
 * Filters for potential countries matching a set of fuzzy creatia
 * @param {Country} country
 * @param {string} countryName
 * @param {string} fuzzyCountryName
 * @param {string|undefined} currencyNumber
 * @param {"full"|"name"|"numeric"} [mode] defaults to "full"
 * @returns {boolean}
 */
function countryFilter(
  country: Country,
  countryName: string,
  fuzzyCountryName: string,
  currencyNumber: string | undefined,
  mode: "full" | "name" | "numeric" = "full"
): boolean {
  if (mode === "full" || mode === "name") {
    let isoName = country.name?.trim().toLowerCase();
    if (isoName) {
      isoName = removeWikipediaAnnotations(isoName);
      isoName = removeAccentsFromString(isoName);
      if (isoName === countryName) {
        return true;
      }
    }

    let isoShortName = country.shortname?.trim().toLowerCase();
    if (isoShortName) {
      isoShortName = removeWikipediaAnnotations(isoShortName);
      isoShortName = removeAccentsFromString(isoShortName);
      if (isoShortName === countryName) {
        return true;
      }

      // Sometimes a countrys shortname may contain enhanced info in brackets
      // which leads to problems with name matching e.g. in country
      // 'Bolivia (Plurinational State of)' which can't be matched with 'Bolivia'.
      // Therefore another fuzzy filter is available for this kind of case.
      let fuzzyIsoShortname = removeBracketInfo(isoShortName);
      if (fuzzyIsoShortname === fuzzyCountryName) {
        return true;
      }
    }
  }

  if (mode === "full" || mode === "numeric") {
    if (country.numeric === currencyNumber) {
      return true;
    }
  }

  return false;
}

/**
 * Fetches a wikipedia table by pageId and index of table on page
 * @param {number} pageId Page identifier
 * @param {index} [index] Default: 0; Index of table in wikipedia page
 * @throws {Error}
 * @returns {Promise<any>}
 */
export async function fetchWikipediaTableById(
  pageId: number,
  index: number = 0
): Promise<any> {
  const document = await wtf.fetch(pageId);
  if (!document) {
    throw new Error(`Could not load page with id ${pageId}`);
  }
  const tables = await document.tables();
  if (tables.length === 0) {
    throw new Error(
      `Could not find currency list on referenced page (${pageId})`
    );
  }
  if (!tables[index]) {
    throw new Error(
      `Could not load table with index ${index} on page with id ${pageId}`
    );
  }
  return await tables[index].keyValue();
}

/**
 * Removes all found emoji from a string and returns the result
 * Source: https://stackoverflow.com/a/41543705/6769680
 * @param {string} str
 * @returns {string}
 */
export function removeEmojiFromString(str: string): string {
  // remove any emoji from this string
  return str.replace(
    /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
}

/**
 * Remove all found accents / diacritis from string and return result
 * Source: https://stackoverflow.com/a/37511463/6769680
 * @param {string} str
 * @returns {string}
 */
function removeAccentsFromString(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Removes annotations from string e.g. '[a]'
 * @param {string} str
 * @returns {string}
 */
function removeWikipediaAnnotations(str: string): string {
  return str.replace(/\s\[[a-z]{1,2}\]/i, "");
}

/**
 * Removes bracket info from string e.g. "Curaçao (CW)" => "Curaçao"
 * @param {string} str
 * @returns {string}
 */
function removeBracketInfo(str: string): string {
  return str.replace(/\(.*\)/g, "").trim();
}
