import http from 'k6/http';
import { group } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};
export default function() {
  group("Last delta materialization for Scale 100", () => {
    const res = http.get(`http://localhost:3000/test/scale100?delta_id=fce36cca-df70-4140-876e-4499867e01f5`, {
      headers: {
        "Content-Type": "application/version-materialization"
      }
    });
    if (res.status !== 200) {
      console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
    }
  });
}
