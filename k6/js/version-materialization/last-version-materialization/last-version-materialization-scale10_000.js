import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("Last delta materialization for Scale 10,000", () => {
    const res = http.get(`http://localhost:3000/test/scale10_000?delta_id=6759ca42-925e-4f98-a00d-14b28f65d8ec`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
