const { Schema } = require('mongoose');
const { getMongoose } = require('../loaders/mongoose');
const { logger } = require('../utils/logger');
const {
  AddressSchema,
  Bytes32Schema,
  ChainIdSchema,
  SafeUintSchema,
  OrderStatusSchema,
  OrderSignSchema,
  TagArraySchema,
  TimestampSchema,
} = require('./common').schema;
const { orderToJsonOption } = require('./common').option;

const log = logger.extend('models:requestorderModel');

const connectedModels = {};

const requestorderSchema = new Schema(
  {
    orderHash: { ...Bytes32Schema, unique: true, index: true },
    order: {
      app: { ...AddressSchema, index: true },
      dataset: { ...AddressSchema, index: true },
      workerpool: { ...AddressSchema, index: true },
      params: { type: String, required: true },
      appmaxprice: SafeUintSchema,
      datasetmaxprice: SafeUintSchema,
      workerpoolmaxprice: SafeUintSchema,
	  taskduration: SafeUintSchema,
      volume: SafeUintSchema,
      tag: Bytes32Schema,
      category: SafeUintSchema,
      trust: SafeUintSchema,
      requester: { ...AddressSchema, index: true },
      beneficiary: { ...AddressSchema, index: true },
      callback: AddressSchema,
      salt: Bytes32Schema,
      sign: OrderSignSchema,
    },
    chainId: ChainIdSchema,
    tagArray: TagArraySchema,
    remaining: SafeUintSchema,
    status: OrderStatusSchema,
    publicationTimestamp: TimestampSchema,
    signer: AddressSchema,
  },
  {
    ...orderToJsonOption,
  },
);

const getModel = async (db) => {
  try {
    if (connectedModels[db]) {
      const model = await connectedModels[db];
      return model;
    }
    connectedModels[db] = new Promise((resolve, reject) => {
      log('getting connection');
      getMongoose({ db })
        .then((mongoose) => {
          log('instanciating model');
          const RequestorderModel = mongoose.model(
            'Requestorder',
            requestorderSchema,
          );
          RequestorderModel.on('index', (err) => {
            if (err) {
              log(`error creating index: ${err}`);
            } else {
              log('index created');
            }
          });
          resolve(RequestorderModel);
        })
        .catch((e) => reject(e));
    });
    const model = await connectedModels[db];
    return model;
  } catch (e) {
    log('getModel() error', e);
    throw e;
  }
};

module.exports = {
  getModel,
};
