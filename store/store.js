const {stringify} = require('csv-stringify');
const fs = require('fs');
const csv = require('csv-parser');

module.exports = {
  async read() {},
  async saveToFile(query, flagValue, __callback) {
    let _fileName = 'liststore.csv';

    let columns = {
      name: 'Name',
      query: 'query',
    };
    const results = [];

    fs.createReadStream(_fileName)
      .pipe(csv())
      .on('data', data => {
        results.push(data);
      })
      .on('end', () => {
        let founded = results.find(o => o.Name == flagValue);

        if (!founded) {
          results.push([flagValue, query]);

          stringify(results, {header: true, columns: columns}, (err, output) =>
            fs.writeFileSync('liststore.csv', output),
          );
        }
        console.log(results);
        __callback(flagValue);
      });
  },
};
