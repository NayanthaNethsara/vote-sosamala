export interface MeResponse {
  uid: string;
  email: string;
  role: "guest" | "admin" | "super-admin";
}
