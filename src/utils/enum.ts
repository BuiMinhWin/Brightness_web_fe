export enum PageEnum {
  LOGIN = "Login",
  REGISTER = "Register",
  FORGOT_PASSWORD = "ForgotPassword",
  SET_PASSWORD = "SetPassword",
}

export const Role: { [key: string]: string } = {
  Customer: "Customer",
  Admin: "=Admin",
};

export enum LinkEnum {
  LINK = "Link",
  NAV_LINK = "NavLink",
}
export enum PaymentMethodEnum {
  VNPAY = "VNPay",
  MOMO = "Momo",
  PAYPAL = "Paypal",
}
