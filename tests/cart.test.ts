import { CartService } from "src/cart";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { productFactory } from "./factories/product.factory";

describe("cart module", () => {
  let cart: CartService;
  const mockDiscounts = [
    {
      code: "SAMUEL10",
      expiration_date: new Date("2025-12-25"),
      percentage: 10,
    },
    {
      code: "REMI5",
      expiration_date: new Date("2026-12-25"),
      amount: 5,
    },
    {
      code: "BAD50",
      expiration_date: new Date("2020-12-25"),
      percentage: 50,
    },
  ];

  beforeEach(() => {
    const mockDiscountManager = {
      mock_values: mockDiscounts,
      findAll: vi.fn(() => mockDiscounts),
      findOne: vi.fn((code) => {
        return mockDiscounts.find((discount) => discount.code === code);
      }),
    };
    cart = new CartService(mockDiscountManager);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should add a product to the cart", () => {
    const product = productFactory({ price: 1, quantity: 1 });

    cart.addProduct(product);

    expect(cart.cart.length).toBe(1);
    expect(cart.cart[0]).toBe(product);
  });

  it("should add an existing product to the cart", () => {
    const product = productFactory({ quantity: 1 });

    cart.addProduct(product);
    cart.addProduct(product);

    expect(cart.cart.length).toBe(1);
    expect(cart.cart[0].quantity).toBe(2);
  });

  it("should throw an error when adding a product with a negative price to the cart", () => {
    const product = productFactory({ price: -1 });

    expect(() => cart.addProduct(product)).toThrowError(
      new Error("You cannot add a product with a negative price")
    );
    expect(cart.cart.length).toBe(0);
  });

  it("should throw an error when adding a product with a quantity price to the cart", () => {
    const product = productFactory({ quantity: -1 });

    expect(() => cart.addProduct(product)).toThrowError(
      new Error("You cannot add a product with a negative quantity")
    );
    expect(cart.cart.length).toBe(0);
  });

  it("should remove an existing product from the cart if the base quantity is 1", () => {
    const product = productFactory({ quantity: 1 });

    cart.addProduct(product);

    expect(cart.cart.length).toBe(1);
    expect(cart.cart[0]).toBe(product);

    cart.removeProduct(product.id);
    expect(cart.cart.length).toBe(0);
  });

  it("should remove 1 to the quantity of an existing product if the base quantity is > 1", () => {
    const product = productFactory({ quantity: 10 });

    cart.addProduct(product);

    expect(cart.cart.length).toBe(1);
    expect(cart.cart[0]).toBe(product);

    cart.removeProduct(product.id);
    expect(cart.cart.length).toBe(1);
    expect(cart.cart[0].quantity).toBe(9);
  });

  it("should throw an error when trying to remove an non-existing product", () => {
    const product = productFactory();

    expect(() => cart.removeProduct(product.id)).toThrowError(
      new Error("You cannot remove an item that is not is the cart")
    );

    expect(cart.cart.length).toBe(0);
  });

  it("should return the quantity of products in the cart", () => {
    const product1 = productFactory({ id: "1", quantity: 10 });
    const product2 = productFactory({ id: "2", quantity: 15 });
    const product3 = productFactory({ id: "3", quantity: 5 });
    const product4 = productFactory({ id: "4", quantity: 1 });

    cart.addProduct(product1);
    cart.addProduct(product2);
    cart.addProduct(product3);
    cart.addProduct(product4);

    expect(cart.cart.length).toBe(4);
    expect(cart.getProductCount()).toBe(31);
  });

  it("should return 0 for the quantity of products in the cart if there is no product", () => {
    expect(cart.cart.length).toBe(0);
    expect(cart.getProductCount()).toBe(0);
  });

  it("should return the total price of products in the cart", () => {
    const product1 = productFactory({ id: "1", quantity: 10, price: 5 });
    const product2 = productFactory({ id: "2", quantity: 15, price: 10 });
    const product3 = productFactory({ id: "3", quantity: 5, price: 1.99 });
    const product4 = productFactory({ id: "4", quantity: 1, price: 0.99 });

    cart.addProduct(product1);
    cart.addProduct(product2);
    cart.addProduct(product3);
    cart.addProduct(product4);

    expect(cart.cart.length).toBe(4);
    expect(cart.getTotal()).toBe(210.94);
  });

  it("should return 0 for the total price of products in the cart if there is no product", () => {
    expect(cart.cart.length).toBe(0);
    expect(cart.getTotal()).toBe(0);
  });

  it("should apply a percentage discount if the code is valid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 4, 10));

    const product = productFactory({ quantity: 1, price: 10 });

    cart.addProduct(product);

    cart.applyDiscount("SAMUEL10");

    expect(cart.getTotal()).toBe(9);
  });

  it("should apply a amount discount if the code is valid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 4, 10));

    const product = productFactory({ quantity: 1, price: 10 });

    cart.addProduct(product);

    cart.applyDiscount("REMI5");

    expect(cart.getTotal()).toBe(5);
  });

  it("should throw an error and not change the total price if the code doesn't exist", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 4, 10));

    const product = productFactory({ quantity: 1, price: 10 });

    cart.addProduct(product);

    expect(() => cart.applyDiscount("BONJOUR")).toThrowError(
      new Error("This discount code doesn't exist")
    );
    expect(cart.getTotal()).toBe(10);
  });

  it("should throw an error and not change the total price if the code is expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 4, 10));

    const product = productFactory({ quantity: 1, price: 10 });

    cart.addProduct(product);

    expect(() => cart.applyDiscount("BAD50")).toThrowError(
      new Error("This discount code is expired")
    );
    expect(cart.getTotal()).toBe(10);
  });
});
