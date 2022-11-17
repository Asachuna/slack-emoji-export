require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { setTimeout } = require("timers/promises");
const axios = require("axios");
const { WebClient } = require("@slack/web-api");

const web = new WebClient(process.env.SLACK_TOKEN);

const exportPath = "./emojis";
const waitTime = 1000;

const imgPath = path.join(exportPath, "img");
if (!fs.existsSync(imgPath)) {
  fs.mkdirSync(imgPath, { recursive: true });
}

(async () => {
  try {
    const response = await web.emoji.list();
    const emojis = response.emoji;

    console.log(`Found ${Object.keys(emojis).length} emojis`);

    //絵文字の一覧をjsonで保存
    fs.writeFileSync(
      path.join(exportPath, "list.json"),
      JSON.stringify(emojis, null, 2)
    );

    //絵文字の画像を保存
    for await (const key of Object.keys(emojis)) {
      try {
        console.log(`Downloading ${key}.png...`);

        const res = await axios.get(emojis[key], {
          responseType: "arraybuffer",
        });

        await fs.promises.writeFile(
          path.join(exportPath, "img", `${key}.png`),
          new Buffer.from(res.data),
          "binary"
        );

        await setTimeout(waitTime);
      } catch (e) {
        console.log(e);
      }
    }
  } catch (e) {
    console.log(e);
  }
})();
