import {
  fetchWikipediaTableById,
  removeEmojiFromString,
  WIKIPEDIA_PAGE
} from "./util";

export interface Country {
  name?: string;
  shortname?: string;
  sovereignity?: string;
  iso2?: string;
  iso3?: string;
  numeric?: string;
  subdivisionCode?: string;
}

interface CountryTableRow {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
}

/**
 * Returns an array of Country objects fetched from Wikipedia page
 * @returns {Promise<Country[]>}
 */
export async function fetchCountries(): Promise<Country[]> {
  const countries = await fetchWikipediaTableById(WIKIPEDIA_PAGE.COUNTRY_LIST);
  return countries.map(mapCountryTable);
}

/**
 * Maps wikipedia table row to internally used country data model
 * @param {CountryTableRow} row Row of wikipedia Country page table
 * @returns {Country}
 */
function mapCountryTable(row: CountryTableRow): Country {
  return {
    name: row.col2.trim(),
    shortname: removeEmojiFromString(row.col1).trim(),
    sovereignity: row.col3.trim(),
    iso2: row.col4.trim(),
    iso3: row.col5.trim(),
    numeric: row.col6.trim(),
    subdivisionCode: row.col7.trim()
  };
}
