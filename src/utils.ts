import * as AJV from 'ajv';
import * as Influx from 'influx';
import { evaluate } from 'mathjs';

import * as schema from './schema/schema.json';
import { InputData } from './types';

export const parseData = (data: InputData): number | InputData => {
  const ajv = new AJV({ allErrors: true });

  if (!ajv.validate(schema, data)) {
    console.log('Invalid JSON properties:', ajv.errorsText());
    return 405;
  }

  console.log('Incomming data:', data);

  if (data.math) {
    const newFields: { [key: string]: number | string } = {};

    // loop through math fields
    Object.entries(data.math).forEach(([mathField, exp]) => {
      // loop through actual field
      if (data.data.fields) {
        Object.entries(data.data.fields).forEach(([fieldName, fieldValue]) => {
          if (fieldName === mathField) {
            // apply math
            newFields[fieldName] = evaluate(exp, { x: fieldValue });
          }
        });
      }
    });

    data.data.fields = Object.assign(data.data.fields, newFields);
  }

  console.log('Outgoing data:', data);
  return data;
};

export const saveData = async (data: InputData): Promise<number> => {
  try {
    const influx = new Influx.InfluxDB(data.db);
    await influx.writePoints([data.data]);

    console.log('Saved');
    return 204;
  } catch (err) {
    console.log(err.message);
    return 406;
  }
};
