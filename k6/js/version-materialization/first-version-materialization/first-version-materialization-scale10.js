import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("First delta materialization for Scale 10", () => {
    const res = http.get(`http://localhost:3000/test/scale10?delta_id=793ecd48-07a1-4d2e-87d8-bd8e0c539030`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
