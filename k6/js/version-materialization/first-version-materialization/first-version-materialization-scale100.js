import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("First delta materialization for Scale 100", () => {
    const res = http.get(`http://localhost:3000/test/scale100?delta_id=7582b605-37e4-479a-89a1-1b245e9b88ab`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
