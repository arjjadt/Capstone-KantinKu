jest.mock('../config/database.js');
jest.mock('../utils/apiResponse.js');
jest.mock('uuid');

const db = require('../config/database');
const apiResponse = require('../utils/apiRespose');
const { v4: uuidv4 } = require('uuid');



