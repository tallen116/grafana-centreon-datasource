import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';
import * as c from './constants';

export interface MyQuery extends DataQuery {
  queryType: string;
  hostId: number;
  serviceId: number;
  metricId: number;
  hostSelection: SelectableValue;
  serviceSelection: SelectableValue;
  metricSelection: SelectableValue;
  isPrestine: boolean;
}

export const defaultQuery: Partial<MyQuery> = {
  isPrestine: true,
  queryType: c.MODE_METRIC,
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
