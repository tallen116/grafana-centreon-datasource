import defaults from 'lodash/defaults';

import { getBackendSrv } from '@grafana/runtime';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  dateTimeFormatISO,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
//import Options from '@grafana/ui/slate-plugins/slate-prism/options';
import _, { parseInt } from 'lodash';

const localStorageKey = 'centreon-token';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  proxyUrl?: string;
  directUrl?: string;
  localStorageKey: string;
  tokenRefresh = false;
  tokenPromise: Promise<any>;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.proxyUrl = instanceSettings.url;
    this.directUrl = instanceSettings.jsonData.httpUrl;

    this.localStorageKey = `${instanceSettings.id}-${localStorageKey}`;

    //this.tokenPromise = new Promise<any>((resolve, reject) => {
    //  resolve('void');
    //});
    this.tokenPromise = this.newTokenPromise();

    console.log('Datasource is initiated');
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    console.log('Query running: ' + options.requestId);

    const { range } = options;

    const dateTimeOptions = { format: 'DATETIME_LOCAL' };
    const from = dateTimeFormatISO(range!.from.valueOf(), dateTimeOptions);
    const to = dateTimeFormatISO(range!.to.valueOf(), dateTimeOptions);

    //const promises = options.targets.map(query =>
    const promises = _.filter(options.targets, query => {
      return query.hide !== true;
    }).map(query =>
      //this.doRequest(query).then(response => {
      this.getMetrics(query.hostId, query.serviceId, from, to).then(response => {
        let metricIndex = -1;
        for (let i = 0; i < response.data.metrics.length; i++) {
          if (parseInt(response.data.metrics[i].metric_id) === query.metricId) {
            metricIndex = i;
          }
        }
        if (metricIndex === -1) {
          //console.log(response);
          throw new Error('MetricId is out of range');
        }
        const frame = new MutableDataFrame({
          name: response.data.metrics[metricIndex].metric_legend,
          refId: query.refId,
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Value', type: FieldType.number },
          ],
        });

        // TODO: Map metrics to framedata
        //response.data.forEach((point: any) => {
        //  frame.appendRow([point.time, point.value]);
        //});
        //console.log(response);
        const numElements = response.data.times.length;
        for (let i = 0; i < numElements - 1; i++) {
          frame.appendRow([response.data.times[i], response.data.metrics[metricIndex].data[i]]);
        }

        return frame;
      })
    );

    //return { data };
    return Promise.all(promises).then(data => ({ data }));
  }

  async testDatasource(token?: string) {
    // Implement a health check for your data source.
    const defaultErrorMessage =
      'Error connecting to Centreon API.  Please check your credentials in the datasource config.';

    // Set true because token is being refreshed
    this.tokenRefresh = true;

    try {
      const result = await getBackendSrv().datasourceRequest({
        method: 'POST',
        url: this.proxyUrl + '/centreonlogin' + '/centreon/api/v2.1/login',
      });

      // Stop refresh token var
      this.tokenRefresh = false;

      if (result.status === 200) {
        const token = await result.data.security.token;
        localStorage.setItem(this.localStorageKey, token);

        console.log('Acquired API token');
        return {
          status: 'success',
          message: 'You have authorized on Centreon',
        };
      } else {
        return {
          isError: true,
          status: 'error',
          message: result.statusText ? result.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      // Stop refresh token var
      this.tokenRefresh = false;

      if (_.isString(err)) {
        return {
          status: 'error',
          message: err,
        };
      } else {
        let message = '';
        message += err.statusText ? err.statusText : defaultErrorMessage;

        return {
          status: 'error',
          message,
        };
      }
    }
  }

  async newTokenPromise() {
    return new Promise<string>((resolve, reject) => {
      resolve('done');
    });
  }

  // Run all requst here for API token management
  // If request return 403 need to authenticate
  // Only run one login to refresh token using testdatasource function
  // Return login promise wrapped with the request promise
  async doRequest(query: any) {
    console.log('Making API request');

    let token = localStorage.getItem(this.localStorageKey);

    if (!this.tokenRefresh && token === null) {
      this.tokenPromise = this.testDatasource();

      const result = await this.tokenPromise.then(() => this.doRequest(query));
    } else {
      const result = await this.tokenPromise.then(() =>
        getBackendSrv()
          .datasourceRequest({
            ...query,
            headers: {
              'X-AUTH-TOKEN': localStorage.getItem(this.localStorageKey),
            },
            responseType: 'json',
          })
          .then(response => {
            this.tokenPromise = this.newTokenPromise();
            return response;
          })
          .catch(error => {
            if (error.status === 403 && error.data.message === 'No token could be found.') {
              localStorage.removeItem(this.localStorageKey);
              return this.doRequest(query);
            }
            return error;
          })
      );
    }

    //    const result = await getBackendSrv().datasourceRequest({
    //      ...query,
    //      headers: {
    //        'X-AUTH-TOKEN': localStorage.getItem(this.localStorageKey),
    //      },
    //      responseType: 'json',
    //    });

    //    if (result.status === 200) {
    //      console.log(result);
    //    }

    return result;
  }

  async getMetrics(hostId: number, serviceId: number, start?: string, end?: string) {
    if (!hostId) {
      throw new Error('Missing Host ID');
    } else if (!serviceId) {
      throw new Error('Missing Service ID');
    }

    const query = {
      url:
        this.directUrl +
        '/centreon/api/v2.1' +
        '/monitoring/hosts/' +
        hostId +
        '/services/' +
        serviceId +
        '/metrics/performance',
      method: 'GET',
      params: {
        start: start,
        end: end,
      },
    };

    const result = this.doRequest(query);
    //console.log(result);
    return result;
  }

  async getHosts(filter = '') {
    // Sample {"host.name": {"$lk": "%%"}}
    const searchfilter = '{"host.name": {"$lk": "%' + filter + '%"}}';

    const query = {
      url: this.directUrl + '/centreon/api/v2.1' + '/monitoring/hosts',
      method: 'GET',
      params: {
        search: searchfilter,
      },
    };

    const result = this.doRequest(query);

    //console.log(result);
    return result;
  }

  async getServiceByHosts(hostId: number, filter = '') {
    // Sample {"service.display_name": {"$lk": "%%"}}
    const searchfilter = '{"service.display_name": {"$lk": "%' + filter + '%"}}';

    const query = {
      url: this.directUrl + '/centreon/api/v2.1' + '/monitoring/hosts/' + hostId + '/services',
      method: 'GET',
      params: {
        search: searchfilter,
      },
    };

    const result = this.doRequest(query);

    return result;
  }
}
