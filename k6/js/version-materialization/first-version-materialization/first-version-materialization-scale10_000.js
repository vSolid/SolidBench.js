import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("First delta materialization for Scale 10,000", () => {
    const res = http.get(`http://localhost:3000/test/scale10_000?delta_id=e1ce3834-69f3-4696-a6dc-7e7ff15be122`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
