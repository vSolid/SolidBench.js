import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("Last delta materialization for Scale 10", () => {
    const res = http.get(`http://localhost:3000/test/scale10?delta_id=8d753ef7-646e-4d81-b6ae-bd139950d815`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
