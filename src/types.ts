import { ISingleHostConfig, IPoint } from 'influx';

export interface InputData {
  db: ISingleHostConfig;
  data: IPoint;
  math?: { [key: string]: string };
}
