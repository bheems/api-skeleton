# api-skeleton
# NodeJS
Using this as a template to build out quick APIs, by reference.

  - Handles asynchronous calls with "request-promise" module
  
    - should use async/await for making larger number of requests
    
  - Response payload should be broken down into clean data before storing in a database
  
  - Meant for APIs that require OAuth token retrieval (by encoding user's credentials as base64 string, or with direct/bypassing credentials)
    - if user credentials are needed, store them in another file 
  
  - Test through Postman/Insomnia
  
  - "npm start" === starts the application server, ported to 8082 (here)
   
  
