function handleCheck(res) {
  if (res.status !== 200) {
    console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
  }
}

module.exports = {handleCheck};
