import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("First delta materialization for Scale 1,000", () => {
    const res = http.get(`http://localhost:3000/test/scale1_000?delta_id=b73af2c6-a361-4a20-a10c-73a72ca5462e`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
