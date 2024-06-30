export async function fetchFilteredData() {
  const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID; // Replace with your spreadsheet ID
  const query = "select * where A = 'alice'"; // SQL-like query to filter rows where name is 'alice'
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // Remove the JSONP wrapping function to get the raw JSON

    // Extract JSON data from the response
    const startIdx = text.indexOf("{");
    const endIdx = text.lastIndexOf("}") + 1;
    const json = JSON.parse(text.slice(startIdx, endIdx));
    const rows = json.table.rows;

    console.log("Got rows: ", rows);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}