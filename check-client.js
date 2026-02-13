import { SquareClient } from 'square';

const client = new SquareClient({
    token: 'test',
    environment: 'sandbox'
});

console.log('client.payments.create:', typeof client.payments.create);
console.log('client.payments.createPayment:', typeof client.payments.createPayment);
console.log('client.payments.list:', typeof client.payments.list);
