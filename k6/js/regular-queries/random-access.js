import http from 'k6/http';
import { group } from 'k6';
import {getRandomURL} from '../../helpers/random-file-accessor.js';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  group("Simple random query", () => {
    const res = http.get(getRandomURL());
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
