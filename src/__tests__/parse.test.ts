import { parseData } from '../utils';

test('Apply math', () => {
  const input = {
    db: {
      host: 'influxdb',
      database: 'db',
      username: 'user',
      password: 'pass',
    },
    data: {
      measurement: 'unique_id',
      fields: {
        temperature: 21867,
        humidity: '55584',
        some_string: 'string here',
      },
    },
    math: {
      temperature: '175 * (x / 65535) - 45',
      humidity: '100 * (x / 65535)',
    },
  };

  const output = {
    db: {
      host: 'influxdb',
      database: 'db',
      username: 'user',
      password: 'pass',
    },
    data: {
      measurement: 'unique_id',
      fields: {
        temperature: 13.39208056763561,
        humidity: 84.81574731059739,
        some_string: 'string here',
      },
    },
    math: {
      temperature: '175 * (x / 65535) - 45',
      humidity: '100 * (x / 65535)',
    },
  };

  expect(parseData(input)).toEqual(output);
});

test('Without math', () => {
  const input = {
    db: {
      host: 'influxdb',
      database: 'db',
      username: 'user',
      password: 'pass',
    },
    data: {
      measurement: 'unique_id',
      fields: {
        temperature: 21867,
        humidity: '55584',
        some_string: 'string here',
      },
    },
  };

  expect(parseData(input)).toEqual(input);
});

test('Math on non-existing field', () => {
  const input = {
    db: {
      host: 'influxdb',
      database: 'db',
      username: 'user',
      password: 'pass',
    },
    data: {
      measurement: 'unique_id',
      fields: {
        temperature: 21867,
        humidity: '55584',
        some_string: 'string here',
      },
    },
    math: {
      non: 'x * 2',
    },
  };

  expect(parseData(input)).toEqual(input);
});

test('Missing required fields', () => {
  const input = {
    db: {
      host: 'influxdb',
    },
    data: {
      measurement: 'unique_id',
      fields: {
        temperature: 21867,
      },
    },
  };

  expect(parseData(input)).toEqual(405);
});
