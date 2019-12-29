declare module "currency-codes" {
  export interface CurrencyCodeRecord {
    code: string;
    number: string;
    digits: number;
    currency: string;
    countries: string[];
    isoCountries: IsoCodeRecord[];
  }

  interface IsoCodeRecord {
    name: string;
    shortname: string;
    sovereignity: string;
    iso2: string;
    iso3: string;
    numeric: string;
    subdivisionCode: string;
  }

  export function code(code: string): CurrencyCodeRecord | undefined;

  export function country(country: string): CurrencyCodeRecord[];

  export function number(number: string): CurrencyCodeRecord | undefined;

  export function codes(): string[];

  export function numbers(): number[];

  export function countries(): string[];
}
