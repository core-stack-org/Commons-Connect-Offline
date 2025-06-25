export default function getImportString(
  screen,
  step,
  latlong,
  settlement_name,
  settlement_id,
  block_name,
  plan_id,
  plan_name,
  crop_id,
  maintain = false,
  userLatLong
) {
  if (userLatLong === null) {
    userLatLong = [0, 0];
  }

  let importString = `../templates/`;

  plan_name = encodeURIComponent(plan_name.toLowerCase());

  if (screen === "Resource_mapping" && step === 0) {
    importString += `add_settlements.json`;
  } else if (screen === "Resource_mapping" && step === 1) {
    importString += `add_well.json`;
  } else if (screen === "Resource_mapping" && step === 2) {
    importString += `water_structure.json`;
  } else if (screen === "Resource_mapping" && step > 2) {
    surveyBody =
      `${import.meta.env.VITE_ODK_CROP_GRID}$smauFD3` +
      "&d[/data/hamlet_id]=" +
      settlement_id +
      "&d[/data/crop_Grid_id]=" +
      crop_id +
      "&d[/data/beneficiary_settlement]=" +
      settlement_name +
      "&d[/data/plan_id]=" +
      plan_id +
      "&d[/data/user_latlon]=" +
      userLatLong[0].toString() +
      "," +
      userLatLong[1].toString() +
      "&d[/data/plan_name]=" +
      plan_name +
      "&d[/data/meta/instanceID]=";
  } else if (screen === "Groundwater" && step === 1 && !maintain) {
    surveyBody =
      `${
        import.meta.env.VITE_ODK_GROUNDWATER_BUILD_RECHARGE
      }$seU5QjKkgGjdav$pga66iH972V93scb8BxwvuBuQVxIUxLo$gf8F` +
      "&d[/data/GPS_point/point_mapsappearance]=" +
      latlong[1].toString() +
      "%20" +
      latlong[0].toString() +
      "&d[/data/block_name]=" +
      block_name +
      "&d[/data/plan_id]=" +
      plan_id +
      "&d[/data/user_latlon]=" +
      userLatLong[0].toString() +
      "," +
      userLatLong[1].toString() +
      "&d[/data/plan_name]=" +
      plan_name +
      "&d[/data/corresponding_work_id]=" +
      "007101" +
      "&d[/data/meta/instanceID]=";
  } else if (screen === "Groundwater" && step === 1 && maintain) {
    surveyBody =
      `${import.meta.env.VITE_ODK_GROUNDWATER_PROVIDE_MAINTAIN}` +
      "&d[/data/GPS_point/point_mapsappearance]=" +
      latlong[1].toString() +
      "%20" +
      latlong[0].toString() +
      "&d[/data/block_name]=" +
      block_name +
      "&d[/data/plan_id]=" +
      plan_id +
      "&d[/data/plan_name]=" +
      plan_name +
      "&d[/data/user_latlon]=" +
      userLatLong[0].toString() +
      "," +
      userLatLong[1].toString() +
      "&d[/data/corresponding_work_id]=" +
      "0001829" +
      "&d[/data/meta/instanceID]=";
  } else if (screen === "SurfaceWater") {
    surveyBody =
      `${import.meta.env.VITE_ODK_SURFACEWATER_BODIES}` +
      "&d[/data/GPS_point/point_mapsappearance]=" +
      latlong[1].toString() +
      "%20" +
      latlong[0].toString() +
      "&d[/data/block_name]=" +
      block_name +
      "&d[/data/plan_id]=" +
      plan_id +
      "&d[/data/plan_name]=" +
      plan_name +
      "&d[/data/user_latlon]=" +
      userLatLong[0].toString() +
      "," +
      userLatLong[1].toString() +
      "&d[/data/beneficiary_settlement]=" +
      settlement_name;
  } else if (screen === "Agriculture" && !maintain) {
    surveyBody = `${import.meta.env.VITE_ODK_AGRICULTURE_WORK}`;
  } else if (screen === "Agriculture" && maintain) {
    surveyBody =
      `${import.meta.env.VITE_ODK_AGRICULTURE_MAINTAIN}` +
      "&d[/data/GPS_point/point_mapsappearance]=" +
      latlong[1].toString() +
      "%20" +
      latlong[0].toString() +
      "&d[/data/block_name]=" +
      block_name +
      "&d[/data/plan_id]=" +
      plan_id +
      "&d[/data/plan_name]=" +
      plan_name +
      "&d[/data/user_latlon]=" +
      userLatLong[0].toString() +
      "," +
      userLatLong[1].toString() +
      "&d[/data/beneficiary_settlement]=" +
      settlement_name;
  } else if (screen === "Livelihood") {
    surveyBody =
      `${import.meta.env.VITE_ODK_ADD_LIVELIHOOD}` +
      "&d[/data/GPS_point/point_mapappearance]=" +
      latlong[1].toString() +
      "%20" +
      latlong[0].toString() +
      "&d[/data/block_name]=" +
      block_name +
      "&d[/data/plan_id]=" +
      plan_id +
      "&d[/data/plan_name]=" +
      plan_name +
      "&d[/data/user_latlon]=" +
      userLatLong[0].toString() +
      "," +
      userLatLong[1].toString() +
      "&d[/data/beneficiary_settlement]=" +
      settlement_name +
      "&d[/data/meta/instanceID]=";
  }

  return importString;
}
