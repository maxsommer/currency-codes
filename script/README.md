# Script

This directory contains a script to update this librarys data.

## How to run

Open a terminal and run the following command in root directory of this repository:

```bash
npm run update-data data-enhanced.json # filename defaults to 'data-enhanced.json' for now
```

## Data sources

- [Wikipedia: ISO 4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) (ISO currency code list)
- [Wikipedia: List of ISO-3166 country codes](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes#Current_ISO_3166_country_codes) (ISO country list)

# Update process

- Fetch latest currency code page from wikipedia
- Build JSON objects from rows
- Fetch latest country code page from wikipedia
- Build JSON objects from rows
- Match `isoCountries` to country names mentioned currencies
