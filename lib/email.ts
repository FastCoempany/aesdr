import { Resend } from 'resend';

export const resend = new Resend(process.env.re_S5BcTBpo_LqnPKMqWT2ihB4iXJvSbYFKM);

export const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL || 'antaeus.coe@gmail.com';