/* =========================================================
   ToolZen Hub
   Official sources

   Every external reference the site links to from a tool,
   lab or lesson's "Learn and check" block, in one list, so a
   link check and a re-check of each page run over one file.

   An entry is a primary source: a standard, a regulator or
   government page, an official product reference, or a bank's
   own rate page. `checkedOn` is the day the page was opened
   and found to be what the entry says (rule 3.6). The site
   never copies a figure from these pages (rule 13.2): it
   points to them.

   To add one: open the page, confirm its title and owner,
   use the address the browser ends on, and set checkedOn.
   tests/unit/knowledge-links.test.mjs checks the shape.
========================================================= */

const CHECKED = "2026-11-15";

const source = (title, publisher, url, kind, note = "") => Object.freeze({ title, publisher, url, kind, note, checkedOn: CHECKED });

export const OFFICIAL_SOURCES = Object.freeze({

    /* standards and technical references */
    "rfc-8259": source("RFC 8259: the JSON data interchange format", "IETF (RFC Editor)", "https://www.rfc-editor.org/info/rfc8259/", "standard"),
    "rfc-9535": source("RFC 9535: JSONPath query expressions for JSON", "IETF (RFC Editor)", "https://www.rfc-editor.org/info/rfc9535/", "standard"),
    "rfc-4180": source("RFC 4180: the CSV file format", "IETF (RFC Editor)", "https://www.rfc-editor.org/info/rfc4180/", "standard"),
    "rfc-7519": source("RFC 7519: JSON Web Token (JWT)", "IETF (RFC Editor)", "https://www.rfc-editor.org/info/rfc7519/", "standard"),
    "rfc-4648": source("RFC 4648: Base16, Base32 and Base64 encodings", "IETF (RFC Editor)", "https://www.rfc-editor.org/info/rfc4648/", "standard"),
    "rfc-3986": source("RFC 3986: URI generic syntax", "IETF (RFC Editor)", "https://www.rfc-editor.org/info/rfc3986/", "standard"),
    "whatwg-url": source("URL Standard (how browsers parse URLs)", "WHATWG", "https://url.spec.whatwg.org/", "standard"),
    "rfc-9562": source("RFC 9562: Universally Unique Identifiers (UUIDs)", "IETF (RFC Editor)", "https://www.rfc-editor.org/info/rfc9562/", "standard"),
    "mdn-json": source("JSON in JavaScript", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON", "documentation"),
    "mdn-date": source("Date in JavaScript (milliseconds since the epoch)", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date", "documentation"),
    "crontab-5": source("crontab(5): the cron table format", "Linux man-pages", "https://man7.org/linux/man-pages/man5/crontab.5.html", "documentation"),
    "iana-tz": source("Time Zone Database", "IANA", "https://www.iana.org/time-zones", "standard"),
    "mdn-image-types": source("Image file type and format guide", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types", "documentation"),
    "sqlite-sql": source("SQL as understood by SQLite", "SQLite", "https://www.sqlite.org/lang.html", "documentation"),
    "ms-excel-functions": source("Excel functions (alphabetical)", "Microsoft Support", "https://support.microsoft.com/en-us/excel/excel-functions-alphabetical", "documentation"),
    "ms-dax": source("DAX reference", "Microsoft Learn", "https://learn.microsoft.com/en-us/dax/", "documentation"),
    "ms-power-query-m": source("Power Query M formula language reference", "Microsoft Learn", "https://learn.microsoft.com/en-us/powerquery-m/", "documentation"),
    "bipm-si": source("The International System of Units (SI)", "BIPM", "https://www.bipm.org/en/measurement-units", "standard"),

    /* India: government and regulators */
    "it-efiling": source("Income Tax e-filing portal", "Income Tax Department, Government of India", "https://www.incometax.gov.in/iec/foportal/", "government"),
    "gst-portal": source("GST portal", "Goods and Services Tax Network", "https://www.gst.gov.in/", "government"),
    "cbic-gst": source("CBIC GST: acts, rules and rate notifications", "Central Board of Indirect Taxes and Customs", "https://cbic-gst.gov.in/", "government"),
    "epfo": source("Employees' Provident Fund Organisation", "EPFO, Government of India", "https://www.epfo.gov.in/", "government"),
    "dicgc": source("Deposit insurance on bank deposits", "DICGC (a subsidiary of the Reserve Bank of India)", "https://www.dicgc.org.in/", "regulator"),
    "rbi-kfs": source("Key Facts Statement (KFS) for loans and advances", "Reserve Bank of India", "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12663", "regulator", "What a lender must show you before you sign, including the annual percentage rate."),
    "rbi-cards": source("Master Direction: credit card and debit card issuance and conduct", "Reserve Bank of India", "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12300", "regulator"),
    "sebi-investor": source("SEBI investor website", "Securities and Exchange Board of India", "https://investor.sebi.gov.in/", "regulator"),

    /* health */
    "who-bmi": source("Body mass index (BMI)", "World Health Organization", "https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index", "standard"),
    "nin-guidelines": source("Dietary Guidelines for Indians", "ICMR - National Institute of Nutrition", "https://www.nin.res.in/dietaryguidelines/", "government"),

    /* banks' own fixed deposit rate pages (rates change: the site shows none) */
    "sbi-fd": source("SBI: retail domestic term deposit rates", "State Bank of India", "https://sbi.bank.in/web/interest-rates/deposit-rates/retail-domestic-term-deposits", "bank"),
    "hdfc-fd": source("HDFC Bank: fixed deposit interest rates", "HDFC Bank", "https://www.hdfc.bank.in/fixed-deposit/fd-interest-rate", "bank"),
    "icici-fd": source("ICICI Bank: fixed deposit interest rates", "ICICI Bank", "https://www.icici.bank.in/personal-banking/deposits/fixed-deposit/fd-interest-rates", "bank"),
    "axis-fd": source("Axis Bank: fixed deposit interest rates", "Axis Bank", "https://www.axis.bank.in/deposits/fixed-deposits/fd-interest-rates", "bank"),
    "bob-fd": source("Bank of Baroda: deposit interest rates", "Bank of Baroda", "https://bankofbaroda.bank.in/interest-rate-and-service-charges/deposits-interest-rates", "bank"),
    "kotak-fd": source("Kotak Mahindra Bank: interest rates", "Kotak Mahindra Bank", "https://www.kotak.bank.in/en/rates/interest-rates.html", "bank")

});
