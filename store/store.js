const {stringify} = require('csv-stringify');
const fs = require('fs');
const csv = require('csv-parser');
const _fileName = 'liststore.csv';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const play = require('../_commands/play');
const query = require('express/lib/middleware/query');

function readStore() {
  return new Promise((resolve, reject) => {
    try {
      let results = [];

      fs.createReadStream(_fileName)
        .pipe(csv())
        .on('data', data => {
          results.push(data);
        })
        .on('end', () => {
          results = results.filter(o => o.Name && o.Name.length);
          resolve(results);
        });
    } catch (error) {
      resolve(false);
    }
  });
}

module.exports = {
  async open(message, __callback) {
    try {
      let content = message.content.replace(/\s\s+/g, ' ');
      let splits = content.split(' ');
      let index = +splits[1];
      readStore().then(results => {
        if (results) {
          let data = results[index];
          if (data) {
            __callback(data.Query);
          } else {
            message.reply('bu indexte kayıt bulunamadı.');
          }
        }
      });
    } catch (error) {
      message.reply(error.message);
    }
  },
  async remove(message, __callback) {
    try {
      let content = message.content.replace(/\s\s+/g, ' ');
      let splits = content.split(' ');
      let index = +splits[1];
      readStore().then(results => {
        if (results) {
          let data = results[index];
          if (data) {
            results = results.filter(o => o.Name != data.Name);

            results = results.map(o => {
              return {
                name: o.Name,
                query: o.Query,
              };
            });

            this.saveListToFile(results, () => message.reply('başarıyla silindi...'));
          } else {
            message.reply('bu indexte kayıt bulunamadı.');
          }
        }
      });
    } catch (error) {
      message.reply(error.message);
    }
  },
  async read(message) {
    readStore().then(results => {
      if (results) {
        let embeds = results.map((item, index) => `${index} - ${item.Name} - ${item.Query}`);

        message.reply({
          embeds: [
            {
              title: 'Kaydedilenler',
              description: embeds.join('\n'),
            },
          ],
        });
      }
    });
  },
  async saveListToFile(list, __callback) {
    const csvWriter = createCsvWriter({
      path: _fileName,
      header: [
        {id: 'name', title: 'Name'},
        {id: 'query', title: 'Query'},
      ],
    });

    csvWriter.writeRecords(list).then(() => {
      if (__callback) __callback();
      console.log('The CSV file was written successfully');
    });
  },
  async saveQueryToFile(query, flagValue, __callback) {
    if (!flagValue.length) return;
    readStore().then(results => {
      if (results) {
        let data = [];

        for (const item of results) {
          data.push({name: item.Name, query: item.Query});
        }

        data.push({
          name: flagValue,
          query,
        });

        this.saveListToFile(data, () => {
          __callback(flagValue);
        });
      }
    });
  },
};
