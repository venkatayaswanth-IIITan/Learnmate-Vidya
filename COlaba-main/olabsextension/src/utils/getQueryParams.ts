function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    sub: params.get("sub"),
    brch: params.get("brch"),
    sim: params.get("sim"),
    cnt: params.get("cnt"),
  };
}

export default getQueryParams;
