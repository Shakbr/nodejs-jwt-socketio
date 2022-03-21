import { body } from 'express-validator';

export default (method) => {
  switch (method) {
    case 'findSegment': {
      return [
        body('query', 'query parameter is required').exists().notEmpty(),
        body('selected_company', 'selected_company parameter is required').exists().notEmpty(),
        body('date', 'date parameter is required').exists().isArray().notEmpty(),
      ]
    }
  }
}
