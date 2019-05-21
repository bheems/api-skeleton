const credentials = require('./credentials.json');
const requestPayload = require('./requestPayload');
const responsePayload = require('./responsePayloads');
const rp = require('request-promise');
const express = require('express');
const fs = require('fs');


function updateID(obj, id) {
    obj.json._id = id;
    return obj;
}

function updateUserId(obj, id) {
    obj.json.user_id = id;
    return obj;
}

function updateNodeId(obj, nodeId) {
    obj.json.node_id = nodeId;
    return obj;
}


function convert_to_base64(credentials){
    let credString = credentials.ID + ":" + credentials.secretKey;
    let encodedString = Buffer.from(credString).toString("base64");
    return encodedString;
}

//defining all routes
const routes = function(app){
    app.post('/oauth', getOauthID);
    app.post('/users', createUser);
    app.get('/users/:id', getUsers);
    app.patch('/users/:id', partiaUserUpdate);
    app.post('/users/:id/nodes', bankInfo_createNode);
    app.get('/users/:id/nodes', nodeDataUpdate_ALL);


};


//retrieve access token
function getOauthID(req, res) {
    requestPayload.getOAuth.headers.Authorization =  `Basic ${convert_to_base64(credentials)}`;
    let {clientInfo} = responsePayload.newUsers;
    rp(requestPayload.getOAuth)
        .then(accessInfo => {
            const {access_token} = accessInfo;
            res.status(200).send({
                token: access_token,
                message: 'Access token successfully retrieved.'
            });



            fs.writeFile ("./responsePayloads.json", JSON.stringify(accessInfo), function(err) {
                    if (err) throw err;
                }
            );

            //accessInfo = JSON.stringify(accessInfo);
            //clientInfo = accessInfo;
            //JSON.stringify(accessInfo);
            //console.log(accessInfo);


        })
        .catch(err => console.log(err));

}


//get consumer information
function getUsers(req, res){
    const {id} = req.params;
    const token = req.header('token');
    requestPayload.getUsers.headers["Authorization"] = "jwt " + token;
    requestPayload.getUsers.headers["OP-User-Id"] = id;
    console.log(requestPayload.getUsers.headers);
    rp(requestPayload.getUsers)
        .then(getResponse =>{
            res.status(200).send(getResponse);
        })
        .catch(err1 => console.log("Get User Information ERROR", err1));
}


//create new consumer
function createUser(req, res){
    const token = req.header('token');
    requestPayload.createUser.headers["Authorization"] = "jwt " + token;

    rp(requestPayload.createUser)
        .then(createResponse => {

            res.status(200).send(createResponse);
        })
        .catch(err2 => console.log("Create User ERROR", err2));
}


//updates (existing) consumer information
/*
If a consumer was previously created with kyc.status = REVIEW, it will be possible to update name, ssn and dob fields.
Otherwise (created with kyc.status = APPROVED) it will not be possible to update these fields, returning 403 Forbidden.
 */
function partiaUserUpdate(req, res){
    const {id} = req.params;
    const token = req.header('token');
    const {first_name, middle_name, last_name, ssn, dob, citizenship_status, citizenship_country, identification, pep} = req.body;
    requestPayload.partialUserUpdate.headers["Authorization"] = "jwt " + token;
    requestPayload.partialUserUpdate.headers["OP-User-Id"] = id;
    requestPayload.partialUserUpdate.body["citizenship_country"] = citizenship_country;
    console.log(requestPayload.partialUserUpdate.body);
    rp(requestPayload.partialUserUpdate)
        .then(updateResponse =>{
            res.status(200).send(updateResponse);
        })
        .catch(err3 => console.log("Update User ERROR", err3));
}


//creating new node - bank information for a new consumer -- should store response information into "responsePayload.json"
function bankInfo_createNode(req, res){
    const{id} = req.params;
    const token = req.header('token');
    requestPayload.createNewBankAccount.headers["Authorization"] = "jwt " + token;
    requestPayload.createNewBankAccount.headers["OP-User-Id"] = id;
    requestPayload.createNewBankAccount.body.participants[0].participant_user_id = id;
    rp(requestPayload.createNewBankAccount)
        .then(createBankAccount =>{
            //res.status(200).send(createBankAccount);
            responsePayload.nodes = {
                "Consumer ID" : id,
                "Bank Information" : createBankAccount
            };
            res.status(200).send(createBankAccount);
        })
        .catch(err4 => console.log("Create Bank Account ERROR", err4));
}


//retrieving all bank accounts linked to the consumer id
function nodeDataUpdate_ALL(req, res){
    const{id} = req.params;
    const token = req.header('token');
    requestPayload.getAllBankInfo.headers["Authorization"] = "jwt " + token;
    requestPayload.getAllBankInfo.headers["OP-User-Id"] = id;
    rp(requestPayload.getAllBankInfo)
        .then(getBankInfo =>{
            res.status(200).send(getBankInfo);
        })
        .catch(err5 => console.log("Retrieving Bank Information ERROR", err5));
}


//update








module.exports = routes;    //exporting routes to main application module