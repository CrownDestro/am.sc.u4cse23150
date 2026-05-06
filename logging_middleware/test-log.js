const { Log } = require("./log");

(async () => {
  try {
    const res = await Log("backend","error","handler","recieved string, expected bool");

    console.log(res);
  } catch (err) {
    console.error("Error:", err);
  }
})();