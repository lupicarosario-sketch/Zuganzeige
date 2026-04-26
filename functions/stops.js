const fs = require("fs");
const path = require("path");

const stopsTxt = fs.readFileSync(path.join(__dirname, "../../gtfs/stops.txt"), "utf8");
const tripsTxt = fs.readFileSync(path.join(__dirname, "../../gtfs/trips.txt"), "utf8");
const stopTimesTxt = fs.readFileSync(path.join(__dirname, "../../gtfs/stop_times.txt"), "utf8");

function parseCSV(data) {
  const lines = data.split("\n").slice(1);
  return lines.map(line => line.split(","));
}

const stops = parseCSV(stopsTxt);
const trips = parseCSV(tripsTxt);
const stopTimes = parseCSV(stopTimesTxt);

const stopMap = {};
stops.forEach(s => {
  const id = s[0];
  const name = s[2];
  stopMap[id] = name;
});

exports.handler = async (event) => {
  try {
    const line = event.queryStringParameters.line;
    const time = event.queryStringParameters.time;
    const destination = decodeURIComponent(event.queryStringParameters.destination);

       const trip = trips.find(t =>
      t.join(" ").includes(line)
    );

    if (!trip) {
      return {
        statusCode: 200,
        body: JSON.stringify([])
      };
    }

    const tripId = trip[2];

        const stopsForTrip = stopTimes
      .filter(st => st[0] === tripId)
      .map(st => ({
        time: st[1],
        stop: stopMap[st[3]] || st[3]
      }));

    return {
      statusCode: 200,
      body: JSON.stringify(stopsForTrip)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: "Fehler bei Zwischenhalten"
    };
  }
};