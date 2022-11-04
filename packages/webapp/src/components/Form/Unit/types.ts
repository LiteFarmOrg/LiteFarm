export interface ISystem {
  metric: {
    units: string[];
    defaultUnit: string;
    breakpoints: number[];
  };
  imperial: {
    units: string[];
    defaultUnit: string;
    breakpoints: number[];
  };
}
