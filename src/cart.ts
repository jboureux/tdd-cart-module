import { z, ZodError } from "zod";
import {
  AmountDiscountCode,
  DiscountManager,
  PercentageDiscountCode,
} from "./discount";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.coerce
    .number()
    .positive("You cannot add a product with a negative price"),
  quantity: z.coerce
    .number()
    .positive("You cannot add a product with a negative quantity"),
});

export type Product = z.infer<typeof ProductSchema>;

export class CartService {
  cart: Product[];
  appliedDiscount: PercentageDiscountCode | AmountDiscountCode | undefined;
  discountManager: DiscountManager;

  constructor(discountManager: DiscountManager, cart?: Product[]) {
    this.discountManager = discountManager;
    this.cart = cart || [];
  }

  addProduct(product: Product): void {
    try {
      ProductSchema.parse(product);

      const existingProductIndex = this.cart.findIndex(
        (item) => item.id === product.id
      );

      if (existingProductIndex !== -1) {
        this.cart[existingProductIndex].quantity += product.quantity;
      } else {
        this.cart.push(product);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }
  removeProduct(productId: string): void {
    const existingProductIndex = this.cart.findIndex(
      (item) => item.id === productId
    );

    if (existingProductIndex === -1) {
      throw new Error("You cannot remove an item that is not is the cart");
    }

    if (this.cart[existingProductIndex].quantity === 1) {
      this.cart.splice(existingProductIndex, 1);
    } else {
      this.cart[existingProductIndex].quantity -= 1;
    }
  }
  getProductCount(): number {
    return this.cart.reduce((curr, acc) => curr + acc.quantity, 0);
  }
  getTotal(): number {
    const inital_total = this.cart.reduce(
      (curr, acc) => curr + acc.quantity * acc.price,
      0
    );

    if (this.appliedDiscount) {
      if ("percentage" in this.appliedDiscount) {
        return (
          inital_total - (inital_total * this.appliedDiscount.percentage) / 100
        );
      } else if ("amount" in this.appliedDiscount) {
        return inital_total - this.appliedDiscount.amount;
      }
    }

    return inital_total;
  }
  applyDiscount(code: string): void {
    const discount = this.discountManager.findOne(code);

    if (!discount) {
      throw new Error("This discount code doesn't exist");
    }

    if (discount.expiration_date < new Date()) {
      throw new Error("This discount code is expired");
    }

    if ("percentage" in discount) {
      this.appliedDiscount = discount as PercentageDiscountCode;
    } else if ("amount" in discount) {
      this.appliedDiscount = discount as AmountDiscountCode;
    }
  }
}
