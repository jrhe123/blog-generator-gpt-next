### docker

- mongodb
- mongo atlas (move to cloud)

### auth

- https://auth0.com/

### cmd

- generate a random password string
  - openssl rand -hex 32

### stripe

- webhook (https://stripe.com/docs/stripe-cli)
- cli create endpointSecret:
  - /stripe login
  - /stripe listen --forward-to localhost:3000/api/webhooks/stripe

### deploy

- vercel
