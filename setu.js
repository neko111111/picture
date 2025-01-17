import fetch from "node-fetch";
import { segment } from "oicq";
import common from "../../lib/common/common.js";
import plugin from "../../lib/plugins/plugin.js";

export class setu extends plugin {
  constructor () {
    super({
      name: "涩图",
      dsc: "随机涩图",
      event: "message",
      priority: 50,
      rule: [
        {
          reg: "^涩图$",
          fnc: "human"
        },
      ]
    });
  }

  async human (e) {
    this.setContext('doHuman')
    e.reply('发送想要的tag和图片数量，多个tag用&隔开，数量放最后，也用&隔开，两者可以只发送一个，或者只发送“默认”随机输出3张图。',
      false, { at: true, recallMsg: 30 })
  }

  async doHuman (e) {
    this.finish('doHuman');
    let temp = JSON.parse(JSON.stringify(this.e.message))[0].text.split('&');
    let n = temp.length;
    let num = temp[n - 1] > 20 ? 3 : /^\d+$/.test(temp[n - 1]) ? temp.pop() : 3;

    if (num > 20) return e.reply("不能超过20张图片,重新发送涩图");

    let url = `https://api.lolicon.app/setu/v2?r18=0&num=${num}`;
    if (temp.length === 1 && /^\d+$/.test(temp[0]) || temp[0] === '默认') {
    } else {
      temp.slice(0, n).forEach(tag => url += `&tag=${tag}`);
    }
    console.log(url)

    fetch(url).then(response => {
      if (!response.ok) return e.reply('response error');
      return response.json();
    }).then(async res => {
      if (res.data.length === 0) return e.reply('找不到对应图片，重新发送');

      const forward = res.data.map((item, index) => {
        const tags = item.tags.join('、');
        e.reply(segment.image(item.urls.original));
        return [`${index + 1}、标题：${item.title}\ntag：${tags}`];
      }).concat([['如有图片数量不足的情况则为被风控，无法发出']]);

      const msg = await common.makeForwardMsg(e, forward, '标题和tag');
      e.reply(msg);
    });
  }

}
