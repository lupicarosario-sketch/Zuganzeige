exports.handler = async function(event) {
  const ACCESS_ID = process.env.ACCESS_ID;

  const STOPS = {
    luxembourg: "200405060",
    esch: "220402046",
    ettelbruck: "140701022",
    bettembourg: "220102018",
    dudelange: "220301015"
  };

  const params = event.queryStringParameters || {};
  const stopKey = params.stop || "luxembourg";
  const STOP_ID = STOPS[stopKey] || STOPS.luxembourg;

  const url =
    `https://cdt.hafas.de/opendata/apiserver/departureBoard?accessId=${ACCESS_ID}&id=${STOP_ID}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const result = (data.Departure || []).map(train => ({
      line: train.name || "-",
      time: train.time || "--:--",
      destination: train.direction || "-",
      track: (train.track || "-").toUpperCase(),
      delay: train.rtTime && train.rtTime !== train.time ? "Verspätet" : "pünktlich"
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Fehler"
    };
  }
};