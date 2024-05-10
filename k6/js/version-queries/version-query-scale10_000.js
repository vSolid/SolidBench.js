import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s'
};

export default function(scale) {
  group(`Version query for Scale 10,000`, () => {
    const res = http.get(`http://localhost:3000/test/scale10_000`, {
      headers: {
        "Content-Type": "application/version-query"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
