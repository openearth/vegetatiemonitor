/***
 * Converst degress to radians
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/***
 * Converts degress to XYZ tiles for a given zoom level
 */
export function degreesToTiles(lon, lat, zoom) {
  const tx = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const ty = Math.floor(
    ((1 -
      Math.log(Math.tan(toRadians(lat)) + 1 / Math.cos(toRadians(lat))) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );

  return [tx, ty];
}

/***
 * TODO: use lodash
 */
export function range(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);
}

export function getUrlParam(name) {
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return (results && results[1]) || undefined;
}