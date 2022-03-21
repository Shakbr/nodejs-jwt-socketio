import moment from 'moment';
import { Client } from '@elastic/elasticsearch';
import { header } from 'express-validator';

const elasticSearch = async (base64Query, aggregation, index, startDate, endDate, size = 0) => {
  const buff = Buffer.from(base64Query, 'base64');
  let query = JSON.parse(buff.toString());
  query = {
    bool: {
      filter: [query],
      must: [
        {
          range: {
            server_time: {
              gte: moment(startDate).toISOString(),
              lte: moment(endDate).toISOString(),
            },
          },
        },
      ],
    }
  };
  const client = new Client({
    node: {
      url: new URL(process.env.OPENSEARCH_URL),
      ssl: {
        rejectUnauthorized: false
      }
    },
    auth: {
      username: process.env.OPENSEARCH_USERNAME,
      password: process.env.OPENSEARCH_PASSWORD
    }
  });

  try {
    return await client.search({
      index: index,
      body: {
        size: size,
        query: query,
        aggs: aggregation
      }
    });
  } catch (error) {
    return false;
  }


};

const generateElasticsearchIndex = async (start, companyNames) => {
  companyNames = Array.isArray(companyNames) ? companyNames : [companyNames];
  let elasticSearchIndex = '';
  const end = moment();

  let loop = moment(start).startOf('month');
  let inc = 0;
  const yearDifference = (end.year() - loop.year()) * 12;
  for (let incLoop = loop.month() + 1; incLoop <= end.month() + 1 + yearDifference; incLoop++) {
    for (const i in companyNames) {
      if (inc > 0) {
        elasticSearchIndex += ',';
      }
      elasticSearchIndex += 'raw_stream_data_' + companyNames[i] + '_' + ('0' + (loop.month() + 1)).slice(-2) + '-' + loop.year();
      ++inc;
    }
    loop = moment(loop).add('1', 'months');
  }

  return elasticSearchIndex;
};

const findSegmentData = async (query, aggregation, companyName, startDate, endDate) => {
  let index = await generateElasticsearchIndex(startDate, companyName);
  return await elasticSearch(query, aggregation,index, startDate, endDate);

};

export {
  generateElasticsearchIndex,
  findSegmentData
};
