import { ClockInfo } from "@/types/ClockInfo";

// time string in the format hh:mm
export async function fetchGoogleTime(timeStr: string) {
  const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID; // Replace with your spreadsheet ID
  // const query = `select * where A = '${timeStr}'`; // SQL-like query to filter rows where name is 'alice'

  const query = `select * where A = '${timeStr}`; // SQL-like query to filter rows where name is 'alice'
  const sheetId = import.meta.env.VITE_GOOGLE_TAB_ID ?? 0; // Replace with your sheet ID
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=${encodeURIComponent(query)}&gid=${sheetId}`;

  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error(`Data request failed with status ${response.status}`);
    }
    const text = await response.text();
    
    // Remove the JSONP wrapping function to get the raw JSON

    // Extract JSON data from the response
    const startIdx = text.indexOf("{");
    const endIdx = text.lastIndexOf("}") + 1;
    const json = JSON.parse(text.slice(startIdx, endIdx));
    if (json.table === undefined) {
      throw new Error('Invalid JSON response, no results found for query');
    }
    const rows = json.table.rows;

    return rows;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function fetchTimeFromSheet(timeStr: string, sheetID: string, tabID: string, meridium?: string, approximation?: string) {
  const spreadsheetId = sheetID;
  // ! would love to use header names here, but it doesn't seem to recognize them
  let query = `select * where A = '${timeStr}'`;

  if (meridium) {
    query += ` and (G = 'any' or G = '${meridium}')`
  }
  if (approximation) {
    query += ` and (H = 'any' or H = '${approximation}')`
  }

  const sheetId = tabID; // Replace with your sheet ID
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=${encodeURIComponent(query)}&gid=${sheetId}`;

  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error(`Data request failed with status ${response.status}`);
    }
    const text = await response.text();
    
    // Remove the JSONP wrapping function to get the raw JSON

    // Extract JSON data from the response
    const startIdx = text.indexOf("{");
    const endIdx = text.lastIndexOf("}") + 1;
    const json = JSON.parse(text.slice(startIdx, endIdx));
    if (json.table === undefined) {
      console.warn('No results found for query');
      return [];
    }
    const rows = json.table.rows;

    return rows;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// time string in the format hh:mm
export async function fetchCurrentTime(timeStr: string, meridium: string) : Promise<ClockInfo> {

  let rows = [];
  const splitTime = timeStr.split(":");
  const minutes = parseInt(splitTime[1]);

  // if the minutes is 00, 15, 30, 45, then we can fetch gutenberg
  if (minutes % 15 === 0) {
    console.log("Querying Gutenberg");
    rows = await fetchTimeFromSheet(timeStr, import.meta.env.VITE_GUTENBERG_SHEET_ID, import.meta.env.VITE_GUTENBERG_TAB_ID ?? 0, meridium);
  } else {
    console.log("Querying google books");
    rows = await fetchTimeFromSheet(timeStr, import.meta.env.VITE_GOOGLE_SHEET_ID, import.meta.env.VITE_GOOGLE_TAB_ID ?? 0, meridium);
  }

  if (rows.length === 0) {

    // * round to closest time in 15 minutes interval
    let roundedMinutes = Math.round(minutes / 15) * 15;

    let approximation = minutes > roundedMinutes ? "after" : "before";
    
    if (roundedMinutes === 60) {
      approximation = 'before';
      roundedMinutes = 0;
    }
 
    let hours = parseInt(splitTime[0]);
    let hourString = hours.toString().padStart(2, "0");

    // if minutes were rounded up to the next hour, increment the hour
    if (roundedMinutes === 0) {
      hourString = (parseInt(splitTime[0]) + 1).toString().padStart(2, "0");
    }
    timeStr = `${hourString}:${roundedMinutes.toString().padStart(2, "0")}`;
    console.log("Looking for approximated time: ", timeStr)
    // * determine if we are just before or just after that time
    rows = await fetchTimeFromSheet(timeStr, import.meta.env.VITE_GOOGLE_APPROX_SHEET_ID, import.meta.env.VITE_GOOGLE_APPROX_TAB_ID, meridium, approximation);
  }

  // select a random row
 
  const randomRow = rows[Math.floor(Math.random() * rows.length)];
  

  /**
   * * rows: An array containing the rows of data.
   *  * Each row has an array c of cell objects.
   *   * Each cell object has:
   *    * v: The value of the cell.
   *    * f: The formatted value of the cell (optional, here only used for the age column).
   */

  const resultObj : ClockInfo = {
    realtime: randomRow["c"][0]["v"],
    sentence: randomRow["c"][1]["v"],
    title: randomRow["c"][2]["v"],
    preview: randomRow["c"][3] ? randomRow["c"][3]["v"] : "",
    author: randomRow["c"][4]["v"],
    expression: randomRow["c"][5]["v"],
    bookNumber: randomRow["c"].length === 8 ? randomRow["c"][7]["v"] : null,
  }

  return resultObj;
}