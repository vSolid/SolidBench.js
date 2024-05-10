import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("Last delta materialization for Scale 1,000", () => {
    const res = http.get(`http://localhost:3000/test/scale1_000?delta_id=2ad8aff4-cce7-4ca2-8e0e-2760c77e2301`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
