# Project #4. Private Blockchain Notary Service

This is Project 4, where I built a Private Blockchain Notary Service (a Star Registry Service that allows users to claim ownership of their favorite star in the night sky). The project is based on the previous Project, **RESTful Web API with Express.js (a Node.js Framework)**. In this project I have created Blockchain ID validation routine (tested using legacy wallet on bitcoin testnet), stored it in mempool and created an API for the private blockchain to register star data onto blockchain and retrieve it. The API functionality is exposed and can be consumed by several types of web clients ranging from desktop, mobile, and IoT devices.

## Pre-requisites

* NodeJS (v10.15 or above recommended)
* Framework: ExpressJS (check "Setup project" instructions below)
* API endpoints documentation: https://documenter.getpostman.com/view/6171412/S1EKzfdD

## Setup project for Review.

To setup the project for review do the following:
1. Download/Clone the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __npm start__ and start interacting with the application using exposed API.

## Testing the project

In order to test the functionality you could use the following tools:

### 1. Postman
* use API endpoints documentation https://documenter.getpostman.com/view/6171412/S1ENzePq
* send GET and POST requests (make sure to run the command `npm start` and keep the server running)

### 2. cURL
#### Submit a validation request to Mempool
`
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}'
`

#### Send a Message-Signature validation request
`
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}'
`

#### Send star data to be stored
`
{
"address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
      "dec": "68° 52' 56.9",
      "ra": "16h 29m 1.0s",
      "story": "Found star using https://www.google.com/sky/"
    }
}
`

#### Get star block by hash
`
curl "http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
`

#### Get star block by wallet address
`
curl "http://localhost:8000/api/stars/address:mq9qmGxm7bwTm2rhZtZR3HX4gcjVJFbTnp"
`

#### Get star block by height
`curl -X GET \
  http://localhost:8000/api/block/2 \
  -H 'cache-control: no-cache'
`

## What did I learn with this Project

* I was able to create a Blockchain dataset that allow user to store a Star.
* Created a Mempool component.
* Created a REST API that allows users to interact with the application.
