const axios = require('axios');

module.exports = {
  async getTrack(query) {
    let token = this.getToken();

    let url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=TR&limit=10`;

    let headers = {
      'Content-type': 'application/json; charset=utf-8',
      Accept: 'application/json; charset=utf-8',
      Authorization:
        'Bearer BQBlxiaYPUrudCdW1p6quhfS_ZMmeHujh7HGUMcWNBUCdGfWzPtI9O1RlAaTkJ2bN5qd2vTbM1DMuNSMzuG6dr6lTD__xeJecAFOP-etg9ilTmEIVF90x0IGOgCClqETO0TwvjwNFypcXuTDCtK2gRQn8v60u_icWWFypIzuq7ya5g',
    };

    let res = await this.getRequest(url, headers);
    let tracks = res.data.tracks.items;
    return tracks[0];
  },
  async getRecommendTrackbyTrackId(trackId) {
    let url = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&market=TR&limit=10&min_popularity=50`;
    let headers = {
      'Content-type': 'application/json; charset=utf-8',
      Accept: 'application/json; charset=utf-8',
      Authorization:
        'Bearer BQBlxiaYPUrudCdW1p6quhfS_ZMmeHujh7HGUMcWNBUCdGfWzPtI9O1RlAaTkJ2bN5qd2vTbM1DMuNSMzuG6dr6lTD__xeJecAFOP-etg9ilTmEIVF90x0IGOgCClqETO0TwvjwNFypcXuTDCtK2gRQn8v60u_icWWFypIzuq7ya5g',
    };

    let res = await this.getRequest(url, headers);
    return res.data.tracks;
  },
  async getToken() {
    return "";
  },
  async getRequest(url, headers) {
    return axios.get(url, {
      headers,
    });
  },
};
