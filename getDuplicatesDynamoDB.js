'use strict';
const AWS = require('aws-sdk');
// Set the region 
const docClient = new AWS.DynamoDB.DocumentClient;
let itemsArray, emailsArray;
exports.handler = async(event) => {
    itemsArray = [];
    emailsArray = [];
    //Get Data from DB
    const data = await getData();
    let sorted_arr = emailsArray.slice().sort();

    let results = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1] == sorted_arr[i]) {
            results.push(sorted_arr[i]);
        }
    }
    console.log('emails Array Length results', results.length);
    console.log(results);

    // for (var i = 0; i < data.Items.length; i++) {
    //     var obj = { DeleteRequest: { Key: { id: data.Items[i].id } } };
    //     itemsArray.push(obj);

    //     if(itemsArray.length % 25 === 0){
    //         const deleteReq = await deleteData();
    //         //console.log(JSON.stringify(deleteReq));
    //         itemsArray = [];
    //     }

    // }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};


async function getData(item) {
    try {
        let data;
        var params = {
            TableName: "User",
            ProjectionExpression: "id, email"
        };
        do {
            data = await docClient.scan(params).promise();
            for (var i = 0; i < data.Items.length; i++) {
                emailsArray.push(data.Items[i].email.toLowerCase());
            }

            params.ExclusiveStartKey = data.LastEvaluatedKey;
        } while (typeof data.LastEvaluatedKey !== "undefined");
        return data;
    }
    catch (err) {
        console.log('getData failed catch', err.message);
        return err;
    }
}

async function deleteData() {
    try {
        const params = {
            RequestItems: {},
        };
        params.RequestItems["User"] = itemsArray;
        const data = await docClient.batchWrite(params).promise();
        return data;
    }
    catch (err) {
        return err;
    }
}
