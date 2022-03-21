import { io } from '../../server.js';
import { validationResult } from 'express-validator';
import moment from 'moment';
import { generateElasticsearchIndex, findSegmentData } from '../utils/elasticSearch.js';

const getFilteredData = async (req, res) => {
  try {
    // const order = new Order(req.body)
    // await order.save()
    // const orders = await Order.find()
    const order = 'test Orderrrrrrrr';
    const orders = 'test Orders';
    io.emit('order-added', orders);
    res.status(201).send(order);
  } catch (error) {
    res.send(error);
  }
};

const findSegment = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  let { query, selected_company, date } = req.body;
  let startDate = date[0];
  let endDate = date[1];

  if (req.body.dynamic) {
    let dynamic = req.body.dynamic;
    if (dynamic > 90) dynamic = 90;
    startDate = moment().subtract(dynamic, 'days');
    endDate = moment();
  }

  if (!req.body.date[1]) endDate = moment();


  let aggregation = {
    'phone_number': {
      'cardinality': {
        'field': 'personal_data.phone_number.keyword'
      }
    },
    'email': {
      'cardinality': {
        'field': 'personal_data.email.keyword'
      }
    },
    'gender': {
      'terms': {
        'field': 'personal_data.gender.keyword'
      },
      'aggs': {
        'amount': {
          'cardinality': {
            'field': 'personal_data.email.keyword'
          }
        }
      }
    }
  };
  const elasticSearchResponse = await findSegmentData(query, aggregation, selected_company, startDate, endDate);
  res.status(200).send({ data: elasticSearchResponse })
};

export {
  getFilteredData,
  findSegment
};
