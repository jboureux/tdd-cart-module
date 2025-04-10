export interface DiscountCode {
  code: string;
  expiration_date: Date;
}

export interface PercentageDiscountCode extends DiscountCode {
  percentage: number;
}

export interface AmountDiscountCode extends DiscountCode {
  amount: number;
}
export class DiscountManager {
  mock_values: DiscountCode[] | undefined;

  findAll(): DiscountCode[] | undefined {
    return this.mock_values;
  }

  findOne(code: string): DiscountCode | undefined {
    return this.mock_values?.filter((discount) => discount.code === code)[0];
  }
}
