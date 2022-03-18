import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';
import * as c from './constants';

export interface MyQuery extends DataQuery {
  queryType: string;
  hostId: number;
  serviceId: number;
  metricId: number;

  group: {
    name: string;
    id: number;
    type: string;
    regex: boolean;
  };
  host: {
    name: string;
    id: number;
    regex: boolean;
  };
  service: {
    name: string;
    id: number;
    regex: boolean;
  };
  metric: {
    name: string;
    id: number;
    regex: boolean;
  };

  hostSelection: SelectableValue;
  serviceSelection: SelectableValue;
  metricSelection: SelectableValue;
  isPrestine: boolean;
}

export const defaultQuery: Partial<MyQuery> = {
  isPrestine: true,
  queryType: c.MODE_METRIC,
  host: {
    name: '',
    id: -1,
    regex: false,
  },
  service: {
    name: '',
    id: -1,
    regex: false,
  },
  metric: {
    name: '',
    id: -1,
    regex: false,
  },
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  httpUrl?: string;
  apiUsername: string;
  validateCerts?: boolean;
  apiVersion: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
  apiPassword?: string;
}
