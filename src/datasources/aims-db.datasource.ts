import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'AIMS_db',
  connector: 'memory',
  localStorage: './data/db.json',
  file: './src/data/db.json'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AimsDbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'AIMS_db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.AIMS_db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
