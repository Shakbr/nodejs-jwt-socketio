import { io } from '../../server.js';
import { validationResult } from 'express-validator';
import moment from 'moment';
import { findSegmentData } from '../utils/elasticSearch.js';

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
  let finalData = {
    phone_number: 0,
    email: 0,
    customers: 0,
    gender: {
      male: 0,
      female: 0
    }
  };

  if (req.body.dynamic) {
    let dynamic = req.body.dynamic;
    if (dynamic > 90) dynamic = 90;
    startDate = moment().subtract(dynamic, 'days');
    endDate = moment();
  }

  if (!req.body.date[1]) endDate = moment();


  let aggregation = {
    'fingerprints': {
      'cardinality': {
        'field': 'fingerprint_hash'
      }
    },
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
  if (elasticSearchResponse) {
    for await (const genderObj of elasticSearchResponse.body.aggregations.gender.buckets) {
      finalData['gender'][genderObj.key] = genderObj.amount.value;
    }
    finalData['email'] = elasticSearchResponse.body.aggregations.email.value;
    finalData['phone_number'] = elasticSearchResponse.body.aggregations.phone_number.value;
    finalData['customers'] = elasticSearchResponse.body.aggregations.fingerprints.value;
  }


  res.status(200).send({ data: finalData });
};

const findSegmentSocket = async (data, socket, io) => {
  console.log(data);
  let { query, selected_company, date } = data;
  let startDate = date[0];
  let endDate = date[1];
  let finalData = [];


  let aggregation = {
    'consentTrue': {
      'filter': {
        'term': {
          'consent': {
            'value': true
          }
        }
      },
      'aggs': {
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
        },
        'Audience': {
          'cardinality': {
            'field': 'fingerprint_hash'
          }
        },
        'Phone Number': {
          'cardinality': {
            'field': 'personal_data.phone_number.keyword'
          }
        },
        'Email': {
          'cardinality': {
            'field': 'personal_data.email.keyword'
          }
        }
      }
    },
    'Audience': {
      'cardinality': {
        'field': 'fingerprint_hash'
      }
    },
    'Phone Number': {
      'cardinality': {
        'field': 'personal_data.phone_number.keyword'
      }
    },
    'Email': {
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
  console.log(elasticSearchResponse.body.aggregations);
  if (elasticSearchResponse) {
    for await (const [key, value] of Object.entries(elasticSearchResponse.body.aggregations)) {
      if (key !== 'consentTrue' ) {
        if (key === 'gender') {
          // for await (const genderObj of value.gender.buckets) {
          //   finalData['gender'][genderObj.key] = genderObj.amount.value;
          // }
        } else {
          finalData.push(
            {
              type: 'Consent True',
              value: elasticSearchResponse.body.aggregations.consentTrue[key].value,
              label: `${key} (${value.value})`
            }
          );
          finalData.push(
            {
              type: 'Consent False',
              value: value.value  - elasticSearchResponse.body.aggregations.consentTrue[key].value,
              label: `${key} (${value.value})`
            }
          );
          // finalData = Object.assign(finalData
          //   {
          //     label: 'Consent False',
          //     value: value.value  - elasticSearchResponse.body.aggregations.consentTrue[key].value,
          //     type: `${key} (${value.value})`
          //   }
          // );
        }
      }
    }

    // finalData['email'] = elasticSearchResponse.body.aggregations.email.value;
    // finalData['phone_number'] = elasticSearchResponse.body.aggregations.phone_number.value;
    // finalData['customers'] = elasticSearchResponse.body.aggregations.fingerprints.value;
  }
  console.log(finalData);
  io.to(socket.id).emit('finalResponse', finalData);
  // return finalData;
  // res.status(200).send({ data: finalData });
};

export {
  getFilteredData,
  findSegment,
  findSegmentSocket
};
